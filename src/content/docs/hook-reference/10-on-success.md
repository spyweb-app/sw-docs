---
title: on_success
description: Called when a scrape cycle completes without errors.
---

`on_success(ctx)` runs after a scrape cycle completes successfully. Defined in `defer.lua`.

## Signature

```lua
function on_success(ctx) -> void
```

## Parameters

| Field | Type | Description |
|-------|------|-------------|
| `ctx` | table | The cycle context table |

## Returns

None.

## Example

```lua
function on_success(ctx)
    log("Cycle completed successfully")
end
```

## See Also

- [on_error](/hook-reference/11-on-error) — Called when cycle fails
- [on_finally](/hook-reference/12-on-finally) — Always called after success or error
