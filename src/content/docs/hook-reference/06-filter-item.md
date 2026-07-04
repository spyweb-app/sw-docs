---
title: filter_item
description: Per-item filter. Replaces built-in keyword filter if defined.
---

`filter_item(item, ctx)` runs once per item. Return the item to keep it, or `nil` to drop it **before** it reaches the database.

:::warning
**Mutually exclusive with keyword filter.** If `filter_item()` exists in your script, the built-in keyword filter is skipped entirely, even if you have `keywords` in your config.
:::

## Signature

```lua
function filter_item(item, ctx) -> table | nil
```

## Parameters

| Field | Type | Mutable | Description |
|-------|------|---------|-------------|
| `item.fields` | table (string→string) | yes | Item fields |
| `item.matches` | array of strings | no | Matched keywords (read-only) |

## Returns

| Return | Effect |
|--------|--------|
| Item table | Keep this item |
| `nil` / `false` | Drop this item |

## Example

```lua
function filter_item(item, ctx)
    local title = (item.fields.title or ""):lower()

    -- Drop unwanted items
    if title == "" or title:find("sponsored") then
        return nil
    end

    -- Mutate fields before storage
    item.fields.title = title:sub(1,1):upper() .. title:sub(2)

    return item
end
```

## See Also

- [after_extract](/hook-reference/05-after-extract) - Batch filter/modify all items
- [before_store](/hook-reference/07-before-store) - Last chance before DB insert
