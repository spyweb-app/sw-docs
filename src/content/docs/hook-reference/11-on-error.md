---
title: on_error
description: Called when a scrape cycle fails with an error.
---

`on_error(err, ctx)` runs when a scrape cycle fails. Defined in `defer.lua`.

## Signature

```lua
function on_error(err, ctx) -> void
```

## Parameters

| Field | Type | Description |
|-------|------|-------------|
| `err` | string | Error message describing the failure |
| `ctx` | table | The cycle context table |

## Returns

None.

## Example

```lua
function on_error(err, ctx)
    notify("Scrape failed", err, 5000)
    log("Error: " .. err)
end
```

## See Also

- [on_success](/hook-reference/10-on-success) — Called when cycle succeeds
- [on_finally](/hook-reference/12-on-finally) — Always called after success or error
