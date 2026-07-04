---
title: before_store
description: Last chance before DB insert. Return nil to skip store + notify.
---

`before_store(items, ctx)` is your last chance to drop items before dedup + insert. Return `nil` to skip storing **and** notifying.

## Signature

```lua
function before_store(items, ctx) -> table | nil
```

## Parameters

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | Array of item tables (`{ fields = { ... }, matches = { ... } }`) |

## Returns

| Return | Effect |
|--------|--------|
| Array of items | Continue with store + notify |
| `nil` / `false` | Skip store and notify entirely |

## Example

```lua
function before_store(items, ctx)
    -- Only store during business hours
    local hour = os.date("*t").hour
    if hour < 9 or hour > 17 then
        return nil  -- don't store, don't notify
    end
    return items
end
```

## See Also

- [filter_item](/hook-reference/06-filter-item) - Per-item filter before store
- [before_notify](/hook-reference/08-before-notify) - Modify items before notification
