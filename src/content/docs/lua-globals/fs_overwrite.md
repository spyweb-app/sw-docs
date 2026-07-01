---
title: fs_overwrite
description: Replaces the entire content of a file in the job's directory.
---

`fs_overwrite(filename, content)` replaces the entire content of a file in the job's directory. Ideal for keeping a "latest" snapshot of your scraping results.

:::note
**CWD-jailed:** Writes to the job's directory. Use `shared/` prefix to write to the project root's shared folder (accessible across jobs and server). Absolute paths are not allowed.
:::

## Signature

```lua
fs_overwrite(filename, content)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `filename` | string | File name (relative to job directory) |
| `content` | string | New file content |

## Returns

None.

## Example

```lua
function after_fetch(fetch_result, ctx)
    if fetch_result.response then
        local etag = fetch_result.response.headers["ETag"]
        if etag then
            fs_overwrite("last_response.json", json_encode({ etag = etag }))
        end
    end
    return fetch_result
end
```

## See Also

- [fs_append](/lua-globals/fs-append) — Append to file
- [fs_read](/lua-globals/fs-read) — Read file content
