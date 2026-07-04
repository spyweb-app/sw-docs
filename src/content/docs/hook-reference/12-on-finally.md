---
title: on_finally
description: Always called after a scrape cycle, whether it succeeded or failed.
---

`on_finally(ctx)` runs after every scrape cycle, regardless of success or failure. Defined in `defer.lua`.

## Signature

```lua
function on_finally(ctx) -> void
```

## Parameters

| Field | Type | Description |
|-------|------|-------------|
| `ctx` | table | The cycle context table |

## Returns

None.

## Example

```lua
function on_finally(ctx)
    log("Cycle finished, cleaning up")
    _G.temp_data = nil
end
```

## See Also

- [on_success](/hook-reference/10-on-success) - Called when cycle succeeds
- [on_error](/hook-reference/11-on-error) - Called when cycle fails
