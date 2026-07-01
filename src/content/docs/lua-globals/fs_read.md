---
title: fs_read
description: Reads a file from the job's directory and returns its content as a string.
---

`fs_read(filename)` reads a file from the job's directory and returns its content as a string. Returns `nil` if the file does not exist.

:::note
**CWD-jailed:** Reads from the job's directory first. Falls back to `shared/` folder if not found locally. Absolute paths are not allowed. Extension-limited to text-based formats.
:::

## Signature

```lua
fs_read(filename)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `filename` | string | File name (relative to job directory) |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| content | string / nil | File content, or nil if file does not exist |

## Example

```lua
function before_fetch(request, ctx)
    local cached = fs_read("last_response.json")
    if cached then
        local data = json_decode(cached)
        request.headers["If-None-Match"] = data.etag
    end
    return request
end
```

## See Also

- [fs_read_binary](/lua-globals/fs-read-binary) — Read binary files
- [fs_overwrite](/lua-globals/fs-overwrite) — Write file content
