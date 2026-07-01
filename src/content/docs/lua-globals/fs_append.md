---
title: fs_append
description: Appends raw content to a file in the job's directory.
---

`fs_append(filename, content)` appends raw content to a file in the job's directory. All writes are non-blocking and safe.

:::note
**CWD-jailed:** Writes to the job's directory. Use `shared/` prefix to write to the project root's shared folder (accessible across jobs and server). Absolute paths are not allowed.
:::

:::note
**Rotation:** Files feature automatic 10MB rotation with timestamped filenames (e.g., `data.20260514-143005.csv`), keeping a history of 5 files.
:::

## Signature

```lua
fs_append(filename, content)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `filename` | string | File name (relative to job directory) |
| `content` | string | Content to append |

## Returns

None.

## Example

```lua
function after_extract(items, ctx)
    for _, item in ipairs(items) do
        local row = string.format("%s,%s\n", item.fields.title, item.fields.price)
        fs_append("data.csv", row)
    end
    return items
end
```

## See Also

- [fs_overwrite](/lua-globals/fs-overwrite) — Replace entire file content
- [fs_read](/lua-globals/fs-read) — Read file content
