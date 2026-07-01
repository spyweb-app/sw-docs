---
title: sleep
description: Pauses execution for a specified duration.
---

`sleep(ms)` pauses execution for a specified duration. Async and yields the Lua VM, allowing other tasks to run while waiting.

## Signature

```lua
sleep(ms)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `ms` | number | Duration to sleep in milliseconds |

## Returns

None.

## Example

```lua
function before_fetch(request, ctx)
    -- Rate limiting: wait 2 seconds between requests
    sleep(2000)
    return request
end
```

## See Also

- [before_fetch](/hook-reference/01-before-fetch) — Modify request before fetching
