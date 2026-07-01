---
title: http_get
description: Performs an HTTP GET request.
---

`http_get(url, [headers])` performs an HTTP GET request. Returns `(response, nil)` on success or `(nil, error_table)` on failure.

:::note
Async and yields the Lua VM. Default timeout 30s, max response body 10MB. Does not support proxy or timeout configuration, use `http_request` for that.
:::

## Signature

```lua
http_get(url, [headers])
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `url` | string | Target URL |
| `headers` | table? | Optional key-value header pairs |

## Returns

**On success:** `(response, nil)`

| Field | Type | Description |
|-------|------|-------------|
| `status` | number | HTTP status code |
| `body` | string | Response body (binary-safe) |
| `headers` | table | Response headers as key-value pairs |
| `url` | string | Final URL (after redirects) |
| `time_ms` | number | Request duration in milliseconds |
| `size` | number | Response body size in bytes |

**On failure:** `(nil, error_table)`

| Field | Type | Description |
|-------|------|-------------|
| `error` | string | Human-readable error message |
| `kind` | string | Error kind: `dns`, `timeout`, `proxy`, `tls`, `connect`, `size`, `http`, or `unknown` |
| `proxy` | string? | Proxy URL that failed (only on proxy errors) |

## Example

```lua
local res, err = http_get("https://api.example.com", {
    ["Authorization"] = "Bearer token123",
    ["X-Custom-Header"] = "my-value"
})
if not res then
    log("request failed: " .. err.error .. " (" .. err.kind .. ")")
    return
end
```

## See Also

- [http_post](/lua-globals/http-post) — HTTP POST request
- [http_request](/lua-globals/http-request) — Arbitrary HTTP request with proxy/timeout support
- [http_multipart](/lua-globals/http-multipart) — Multipart form upload
