---
title: override_extract
description: Replace the built-in CSS extractor with custom extraction logic.
---

`override_extract(response, ctx)` completely replaces SpyWeb's internal HTML/CSS scraper. Use this to parse non-HTML data (like JSON or XML) or apply entirely custom extraction logic.

## Signature

```lua
function override_extract(response, ctx) -> table | nil | false
```

## Parameters

| Field | Type | Description |
|-------|------|-------------|
| `response` | table | The response object from the fetch phase (after `after_fetch` has run) |

## Returns

| Return | Effect |
|--------|--------|
| Array of structured items | The items must use the standard item structure (`{ fields = { ... } }`). The keys within `fields` must match the `fields` defined in `jobs.toml`. Output acts exactly like native extraction and will still pass through `after_extract` if defined. |
| `nil` or `false` | Treats as zero items (no extraction) |

:::note
The `matches` field is **immutable and system-owned**. Even if you define it in your Lua table, the engine will ignore it. Instead, the engine automatically populates this field by scanning your returned `fields` against the job's keywords after the hook returns.
:::

## Example

```lua
function override_extract(response, ctx)
    local data = json_decode(response.body)
    local items = {}
    for i, post in ipairs(data.posts) do
        table.insert(items, {
            fields = {
                author = post.user.name,
                message = post.content
            }
        })
    end
    return items
end
```

## See Also

- [after_extract](/hook-reference/05-after-extract) - Batch filter or modify all extracted items
