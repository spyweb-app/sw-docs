---
title: before_webhook
description: Reshape or silence webhook POSTs.
---

`before_webhook(payload, ctx)` reshapes or silences webhook POSTs. Receives the full JSON payload (job_name, item_count, items).

## Signature

```lua
function before_webhook(payload, ctx) -> table | nil
```

## Parameters

| Field | Type | Description |
|-------|------|-------------|
| `payload.job_name` | string | Job name |
| `payload.item_count` | number | Number of new items |
| `payload.items` | array | Array of item tables |

## Returns

| Return | Effect |
|--------|--------|
| Modified payload | Continue with webhook |
| `nil` / `false` | Silence webhook |

## Example

```lua
function before_webhook(payload, ctx)
    local job = payload.job_name
    local count = payload.item_count

    -- DISCORD FORMAT
    local embeds = {}
    for _, item in ipairs(payload.items) do
        table.insert(embeds, {
            title = item.fields.title or "New Item",
            url = item.fields.link,
            color = 10640871,
            description = "Matched: " .. table.concat(item.matches, ", ")
        })
    end
    return {
        content = "**" .. job .. "** found " .. count .. " new items!",
        embeds = embeds
    }
end
```

```lua
function before_webhook(payload, ctx)
    -- SLACK FORMAT
    local blocks = {
        {
            type = "section",
            text = { type = "mrkdwn", text = "*SpyWeb Alert:* " .. payload.job_name .. " found " .. payload.item_count .. " items." }
        }
    }
    for _, item in ipairs(payload.items) do
        table.insert(blocks, { type = "divider" })
        table.insert(blocks, {
            type = "section",
            text = { type = "mrkdwn", text = "<" .. (item.fields.link or "#") .. "|" .. (item.fields.title or "Item") .. ">" }
        })
    end
    return { blocks = blocks }
end
```

## See Also

- [before_notify](/hook-reference/08-before-notify) - Modify items before notification
