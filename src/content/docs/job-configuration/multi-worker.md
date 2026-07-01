---
title: Multi-Worker Jobs
description: Concurrent scraping with multiple workers.
sidebar:
  order: 3
---

Multi-worker mode lets a single job run multiple concurrent scraping cycles. Useful for monitoring many URLs with one job or load-testing a single endpoint.

## When to Use Multi-Worker

- **Shared State Coordination** — All workers share the same Lua VM. Maintain in-memory caches, global rate-limiters, or IP rotation state without database roundtrips.
- **Pipeline Consolidation** — Process many URLs with identical extraction logic in a single job.
- **Parallel Queue Processing** — Large list of `urls` processed with maximum throughput.
- **I/O Wait Mitigation** — Workers keep the engine productive during network handshakes.
- **High-Frequency Monitoring** — Reduce time gap between checks for volatile data.

**When NOT to use it:**
- Anti-bot detection triggers on high concurrency from a single IP
- Sequential execution order is required
- Resource constraints on small VPS

## Operational Modes

A job picks one of three modes based on config:

| Mode | Config | What happens |
|------|--------|-------------|
| URL queue | `urls` is set (any `workers`) | URLs distributed across workers |
| Multi-worker single URL | `workers > 1`, no `urls` | Every worker independently scrapes the same URL |
| Single worker | default (`workers = 1`, no `urls`) | One inline cycle, no task overhead |

`urls` takes priority — if set, the job always uses URL queue mode. When `urls` is present, the `url` field is ignored.

## URL Queue Mode

```toml
name = "Product Monitor"
urls = [
  "https://shop.example.com/electronics",
  "https://shop.example.com/clothing",
]
workers = 4
selector = ".item"
fields = ["title:h2", "price:.price"]
```

All URLs go into a shared queue. Each worker grabs the next available URL, runs its cycle, then grabs another. When the queue is empty, workers shut down.

## Multi-Worker Single URL Mode

```toml
name = "Dynamic URL Dispatcher"
url = "https://example.com"
workers = 4
```

**Why use this?** Dynamic URL assignment, concurrent processing across identical pipelines, and improved throughput for large URL lists.

The engine spawns `workers` tasks. Use `before_fetch` to dynamically assign URLs:

```lua
function before_fetch(request, ctx)
    request.url = "https://example.com/api/data?page=" .. ctx.worker_id
    return request
end
```

## Worker ID

Each worker gets a unique `ctx.worker_id` (1-based integer):

- In **URL queue mode** — IDs are persistent lanes; worker 1 always handles the first URL, worker 2 the second, etc.
- In **single-URL multi-worker** — worker IDs are assigned at spawn; each worker gets one ID for its lifetime.
- **Single worker** — always gets ID 1.

Use `worker_id` to distribute work without collisions:

```lua
function before_fetch(request, ctx)
    request.url = "https://example.com/api/data?page=" .. ctx.worker_id
    return request
end
```

## Worker Stagger

Workers launch with 200ms intervals to avoid burst detection:

```
Worker 1: start
Worker 2: start +200ms
Worker 3: start +400ms
Worker 4: start +600ms
```

The stagger prevents socket exhaustion (`EADDRNOTAVAIL`), DNS burst failures, and rate-limit triggers. The stagger only affects the initial launch of workers within a single job iteration — after a worker finishes one URL and grabs the next from the queue, it runs again immediately with no re-staggering.

## Job-Level Completion with `on_finished`

Use `on_finished` for multi-worker batch jobs that need post-processing after all workers complete. For single-worker jobs, `on_success` / `on_error` / `on_finally` are more idiomatic.

Place `on_finished` and `on_finally` in `defer.lua` so they are available in the same scope as shared state.

```lua
function on_finally(ctx)
    _G.batch_stats = _G.batch_stats or { success = 0, error = 0 }
    if ctx.telemetry.map.fetch.status == "success" then
        _G.batch_stats.success = _G.batch_stats.success + 1
    else
        _G.batch_stats.error = _G.batch_stats.error + 1
    end
end

function on_finished()
    log("Batch finished. Success: " .. _G.batch_stats.success .. ", Errors: " .. _G.batch_stats.error)
    _G.batch_stats = nil
end
```

`on_finished` receives no `ctx` and runs once per job iteration (not per worker).

## Shared State Semantics

- **`ctx.shared`** — Worker-cycle scoped, destroyed when worker finishes its URL
- **`_G` (global)** — Batch-wide state, persists across all workers. Always clear in `on_finished()`. Do not use `_G` for per-worker state — race conditions can corrupt values across workers.
- **Storage** — `store_set`/`store_get`/`global_store_*` go through a Lua mutex, safe from any worker
- **Browser instances** — can be shared across workers via globals

## Worker Fault Tolerance

- Each worker runs in its own concurrent task
- A fatal error in one worker does not affect others (poison-safe queue)
- The queue does not crash if a worker panics — remaining workers continue processing
- The job loop continues and still triggers `on_finished()`

## Concurrency Settings

| Setting | Type | Scope | Description |
|---------|------|-------|-------------|
| `SPYWEB_THREADS` | Env Var | Process | Total OS threads available to the runtime |
| `workers` | Config | Per-Job | Number of concurrent scraping workers |

Set `SPYWEB_THREADS` to your CPU core count. A `workers` value higher than `SPYWEB_THREADS` causes contention — workers queue up waiting for a free thread. Tune `workers` against your target's rate limits.

If `SPYWEB_THREADS` is not set, the app defaults to **2 threads**. Set it explicitly for production.

## Config Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `workers` | integer | `1` | Number of concurrent scraping workers |
| `urls` | array | — | URL queue; takes priority over `url` |

## Troubleshooting

| Problem | Likely Cause |
|---------|-------------|
| `ctx` is nil in a deferred task | The worker context is destroyed when the cycle ends. Capture values in closures instead. |
| Global variable ghosts | `_G` state persists across workers. Always clear in `on_finished()`. |
| Unexpected URL behavior | If `urls` is set, `url` is ignored. Check which field your job uses. |

## Database-Driven Multi-Target Monitoring

```lua
db_exec([[
    CREATE TABLE IF NOT EXISTS targets (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        interval_sec INTEGER DEFAULT 60,
        last_hit INTEGER DEFAULT 0
    )
]])

function before_fetch(request, ctx)
    local now = os.time()
    local rows = db_query([[
        UPDATE targets SET last_hit = ?
        WHERE id = (SELECT id FROM targets WHERE (? - last_hit) >= interval_sec LIMIT 1)
        RETURNING id, url
    ]], { now, now })

    if #rows == 0 then return nil end
    local task = rows[1]
    request.url = task.url
    ctx.shared.target_id = task.id
    return request
end
```

```lua
function after_fetch(response, ctx)
    local task_id = ctx.shared.target_id
    if not task_id then return end
    local status = ctx.telemetry.map.fetch.status == "success" and "completed" or "failed"
    db_exec("UPDATE targets SET last_hit = ? WHERE id = ?", { os.time(), task_id })
end
```

With `workers > 1`, the database acts as the central orchestrator. Each worker independently claims the next due target.
