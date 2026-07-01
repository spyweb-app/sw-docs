---
title: fs_read_binary
description: Reads a binary file from the job's directory.
---

`fs_read_binary(filename)` reads a binary file from the job's directory. Returns `nil` if the file does not exist.

:::note
**CWD-jailed:** Reads from the job's directory first. Falls back to `shared/` folder if not found locally. Absolute paths are not allowed. Unlike `fs_read`, handles non-UTF-8 files like images and other binary formats.
:::

## Signature

```lua
fs_read_binary(filename)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `filename` | string | File name (relative to job directory) |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| content | string / nil | Binary-safe file content, or nil if file does not exist |

## Example

```lua
local png_data = fs_read_binary("screenshot.png")
local resp = http_multipart("https://api.example.com/upload", {
    file = { content = png_data, filename = "page.png", type = "image/png" }
})
```

## See Also

- [fs_read](/lua-globals/fs-read) — Read text files
- [http_multipart](/lua-globals/http-multipart) — Upload files via HTTP
