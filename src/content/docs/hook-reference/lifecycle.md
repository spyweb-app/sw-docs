---
title: Lifecycle
description: defer, defer.lua, and cleanup hooks.
sidebar:
  order: 1
---

After the pipeline stages finish, these lifecycle mechanisms handle cleanup and orchestration.

## Flow

```
before_fetch → override_fetch → fetch → after_fetch
    ↑            nil→fetch fail    auto    nil→skip
    │                                      │
    │                                      ▼
sleep(interval)                   override_extract
    │                                nil→empty
    ↑                                      │
    │                                      ▼
on_finished                             extract
    │                                    auto
    ↑                                      │
    │                                      ▼
  on_finally                          after_extract
     │                              nil→skip rest
    ↑                                      │
    │                                      ▼
on_success/error                       filter_item
     │                              nil→skip item
    ↑                                      │
    │                                      ▼
notify+webhook                        before_store
     │                              nil→skip s/n
    ↑                                      │
    │                                      ▼
before_webhook                       dedup+insert
nil→skip                                 auto
    ↑                                      │
    │                                      │
before_notify ←────────────────────────────┘
nil→skip notif
```

All lifecycle hooks (`on_success`/`on_error` → `on_finally` → `on_finished` → `sleep`) fire every cycle regardless of nil skips.

## Hook-Scoped Cleanup: `defer(fn)`

`defer(fn)` registers a callback executed **immediately after the current hook finishes**, regardless of success or error.

- **Scope:** Hook-Level - tied to the top-level hook, not the local Lua function
- **Order:** LIFO (Last-In, First-Called)
- **Isolation:** Each hook stage has its own isolated defer queue
- **Error Safety:** If a deferred function errors, it is logged and the remaining queue still fires

```lua
function override_fetch(request, ctx)
    local browser = cdp.launch({ headless = true })
    defer(function() browser:close() end)

    local page = browser:attach()
    local ok, err = page:open(request.url)
    if not ok then
        return { error = "Navigation failed: " .. tostring(err) }
    end
    return { status = 200, body = page:content() }
end
```

### Defer is Synchronous

`defer()` callbacks run synchronously. Async bindings (like `http_post`, `sleep`, `cdp.launch`) cannot be called inside them. Only resource close methods (`browser:close()`, `page:close()`) are safe.

## Cycle-Scoped Orchestration: `defer.lua`

`defer.lua` is an optional file in your job directory for logic requiring a "whole cycle is done" guarantee.

| Function | When it fires | Use Case |
|----------|---------------|----------|
| `on_success(ctx)` | Cycle completed without fatal errors | Post-run telemetry, aggregate success APIs |
| `on_error(err, ctx)` | Cycle failed with a fatal error | Critical failure alerts (Discord/Slack) |
| `on_finally(ctx)` | Always fires at end of every cycle | State reset, writing audit logs |

`defer.lua` shares the same Lua VM as `hooks.lua`. All lifecycle hooks **fully support async bindings**.

```lua
-- hooks.lua
function after_extract(items, ctx)
    ctx.shared.item_count = #items
    return items
end

-- defer.lua
function on_finally(ctx)
    local count = ctx.shared.item_count or 0
    local payload = json_encode({ items = count })
    http_post("https://metrics.example.com/push", payload, {
        ["Content-Type"] = "application/json"
    })
end
```

## Job-Loop Hook: `on_finished()`

`on_finished()` fires **after every complete job iteration** - after all workers finish their cycles, just before sleep.

**Single-worker jobs:** If `workers = 1`, `on_finished` fires immediately after `on_finally`. Use `on_finally` instead.

| Aspect | `on_finished()` | `on_finally(ctx)` |
|--------|-----------------|-------------------|
| Scope | Across all workers in a job iteration | Per-cycle (per-worker) |
| When | After all workers complete, before sleep | After each individual cycle ends |
| `ctx` | None | Receives per-cycle `ctx` |
| Defined in | `hooks.lua` or `defer.lua` | `defer.lua` |

```lua
function on_finished()
    log("Job iteration complete, sleeping until next interval")
end
```

## ctx.worker_id

Each worker receives a 1-based `worker_id` via the cycle context:

```lua
function before_fetch(request, ctx)
    log("Worker " .. ctx.worker_id .. " processing " .. request.url)
    return request
end
```

- Ranges from `1` to `workers`
- Read-only - writing `ctx.worker_id = ...` raises an error
- Single-worker jobs always have `worker_id = 1`

## Which mechanism should I use?

| Goal | Mechanism |
|------|-----------|
| Close a browser/page opened in a single hook | `defer()` |
| Push aggregate metrics after a cycle finishes | `defer.lua` + `on_success` / `on_finally` |
| Alert on job failure via HTTP API | `defer.lua` + `on_error` |
| Clean up shared state at end of a run | `defer.lua` + `on_finally` |
| Handle nested resources in a specific order | `defer()` multiple times (LIFO) |
| Log/track job-level completion across all workers | `on_finished()` in `defer.lua` |

## Memory Hygiene

SpyWeb automatically wipes transient cycle state (like `last_fetch`, `selector_matches`) from the per-cycle context after `on_finally` returns.
