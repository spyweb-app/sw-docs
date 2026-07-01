---
title: before_notify
description: Reshape or silence desktop notifications.
---

`before_notify(items, ctx)` runs after items are saved to the DB. It receives only the **new items** that passed deduplication. Use this to silence "noisy" desktop alerts without affecting webhooks.

## Signature

```lua
function before_notify(items, ctx) -> table | nil
```

## Parameters

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | Array of new items (same shape as `filter_item` input) |

## Returns

| Return | Effect |
|--------|--------|
| Array of items | Continue with notification |
| `nil` | Silence desktop notification |

## Example

```lua
function before_notify(items, ctx)
    -- Silence notifications if fewer than 3 new items
    if #items < 3 then return nil end

    -- Only notify for the first 5 items
    local capped = {}
    for i = 1, math.min(#items, 5) do
        capped[i] = items[i]
    end
    return capped
end
```

## See Also

- [before_webhook](/hook-reference/before-webhook) — Modify or silence webhook payloads
- [before_store](/hook-reference/before-store) — Last chance before DB insert
