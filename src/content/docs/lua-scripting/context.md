---
title: Context (ctx)
description: Per-cycle context fields reference.
sidebar:
  order: 3
---

Every hook except `on_finished()` receives a per-cycle context table as its second argument. It's created fresh for each scrape cycle and discarded at the end.

## Engine-Set Fields

### `ctx.last_fetch`

FetchAttempt envelope representing the last network fetch.

| Field | Type | Description |
|-------|------|-------------|
| `ok` | boolean | Whether the fetch succeeded |
| `request` | table | `url`, `method`, `headers`, `timeout`, `proxy`, `max_body_size` |
| `response` | table? | `status`, `url`, `body`, `headers`, `time_ms`, `size`, `proxy` (only on success) |
| `error` | table? | `message`, `kind` (only on failure) |

```lua
function after_extract(items, ctx)
    if ctx.last_fetch and ctx.last_fetch.ok then
        log("Fetch was successful: " .. ctx.last_fetch.response.status)
    end
    return items
end
```

### `ctx.selector_matches`

Number of CSS selector hits found during extraction. Useful for detecting outdated selectors.

```lua
print("Found " .. #items .. " items (out of " .. ctx.selector_matches .. " selector hits)")
```

### `ctx.telemetry`

Performance telemetry for the current scraping cycle.

| Field | Type | Description |
|-------|------|-------------|
| `job_name` | string | Name of the job |
| `start_time` | number | Epoch timestamp (seconds) when cycle started |
| `total_duration_ms` | number | Total duration of the cycle in milliseconds |
| `stages` | array | Sequence of stage records |

**Stage record fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Stage name (e.g. `before_fetch`, `fetch`, `override_extract`) |
| `status` | string | `success`, `error`, or `inactive` |
| `type` | string | `hook` for Lua hooks, `internal` for engine-native stages |
| `duration_ms` | number | Stage execution time in milliseconds |
| `lua_mem_bytes` | number | Total Lua memory usage after the stage |
| `mem_delta_bytes` | number | Change in Lua memory during this stage |
| `browsers` | number | Number of active browser processes |
| `error` | string? | Error message if the stage failed |

```lua
function on_finally(ctx)
    if ctx.telemetry then
        log("Job completed in " .. ctx.telemetry.total_duration_ms .. "ms")
        for _, stage in ipairs(ctx.telemetry.stages) do
            log("  " .. stage.name .. ": " .. stage.duration_ms .. "ms (" .. stage.status .. ")")
        end
    end
end
```

### `ctx.shared`

A table for passing data between hooks within the same cycle.

```lua
function before_fetch(request, ctx)
    ctx.shared.start_time = os.clock()
    return request
end

function after_extract(items, ctx)
    local elapsed = os.clock() - ctx.shared.start_time
    log("Extraction took " .. elapsed .. " seconds")
    return items
end
```

### `ctx.worker_id`

1-based index for multi-worker jobs. Always `1` for single-worker jobs. Read-only.

```lua
function before_fetch(request, ctx)
    log("Worker " .. ctx.worker_id .. " processing")
    return request
end
```

## User-Defined Fields

You can set any additional fields on `ctx` in any hook. They persist until the cycle ends.

```lua
function before_fetch(request, ctx)
    ctx.my_custom_flag = true
    return request
end
```
