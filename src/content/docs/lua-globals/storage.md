---
title: Persistent Storage
description: Job-scoped and global persistent key-value storage.
---

SpyWeb supports state management through both **Runtime Memory** (transient) and an **Embedded Database** (persistent). Memory is fast but resets on reload; the database survives restarts.

:::note
**Race Condition Note:** Both Runtime Memory and Job-Local Storage are safe by default. Hooks for a single job are execution-locked (sequential), so race conditions are impossible within a single job. Use `global_store_incr` when mutating state shared across multiple concurrent jobs.
:::

## Job-Scoped Storage (Persistent)

### store_set

```lua
store_set(key, value)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

Saves a string (prefixed with job name).

### store_get

```lua
store_get(key)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

Retrieves a string or `nil`.

### store_delete

```lua
store_delete(key)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

Removes a key.

### Example

```lua
-- Circuit breaker: stop after 5 consecutive failures, reset after 300s cooldown
local max_failures = 5
local cooldown = 300
local last_reset = tonumber(store_get("breaker_last_reset") or "0")

if tonumber(store_get("breaker_failures") or "0") >= max_failures then
    if os.time() - last_reset < cooldown then
        log("circuit breaker open — skipping request")
        return
    end
    store_set("breaker_failures", "0")
    store_set("breaker_last_reset", tostring(os.time()))
end

local ok, err = http_get("https://api.example.com/status")
if not ok then
    local count = tonumber(store_get("breaker_failures") or "0") + 1
    store_set("breaker_failures", tostring(count))
    log("failure " .. count .. "/" .. max_failures .. ": " .. tostring(err.error))
end
```

---

## Global Shared Storage (Persistent)

### global_store_set

```lua
global_store_set(key, value)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

Saves a string shared across all jobs.

### global_store_get

```lua
global_store_get(key)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

Retrieves a shared string or `nil`.

### global_store_delete

```lua
global_store_delete(key)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

Removes a shared key.

### global_store_incr

```lua
global_store_incr(key, default, delta)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

**Atomic** shared increment across all jobs. Use this when mutating state shared across multiple concurrent jobs.

### Example

```lua
-- WRONG (race condition prone across concurrent jobs)
local v = tonumber(global_store_get("global_fail_count") or "0")
global_store_set("global_fail_count", tostring(v + 1))

-- CORRECT (race condition safe atomic increment)
local new_count, err = global_store_incr("global_fail_count", 0, 1)
if not new_count then
    log("failed to increment global counter: " .. tostring(err))
end
```

---

## Runtime Memory (Transient)

Standard Lua variables persist in memory as long as the job is active in its isolated VM. Resets on hot-reload or restart.

```lua
visit_count = (visit_count or 0) + 1
log("Session visit: " .. visit_count)
```

:::note
`ctx.last_fetch` also persists per-cycle.
:::
