---
title: after_extract
description: Batch filter or modify all items before processing.
---

`after_extract(items, ctx)` receives **all** extracted items at once. Good for cross-item logic, dedup, or sorting.

**No short-circuit:** returning `nil` or empty table just means no items, not a pipeline abort.

## Signature

```lua
function after_extract(items, ctx) -> table
```

## Parameters

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | Array of item tables |

Each item has:
- `item.fields` — table (string→string)
- `item.matches` — READ-ONLY: Populated by engine

## Returns

| Return | Effect |
|--------|--------|
| Array of items | Continue with modified items |
| Empty table / `nil` | No items to process |

## Example

```lua
function after_extract(items, ctx)
    -- Remove duplicate titles
    local seen = {}
    local unique = {}
    for _, item in ipairs(items) do
        local title = item.fields.title or ""
        if not seen[title] and title ~= "" then
            seen[title] = true
            table.insert(unique, item)
        end
    end
    return unique
end
```

## See Also

- [override_extract](/hook-reference/override-extract) — Replace the built-in CSS extractor
- [filter_item](/hook-reference/filter-item) — Per-item filter (replaces built-in keyword filter)
