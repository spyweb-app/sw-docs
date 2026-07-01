---
title: http_request
description: Performs an arbitrary HTTP request with full control.
---

`http_request(options)` performs an arbitrary HTTP request with full control over method, URL, body, headers, proxy, timeout, and response size limit. Returns `(response, nil)` on success or `(nil, error_table)` on failure.

:::note
Async and yields the Lua VM. Supports all options including proxy and timeout. POST/PUT/PATCH require a body.
:::

## Signature

```lua
http_request(options)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | string | No | HTTP method (GET, HEAD, POST, PUT, DELETE, etc.). Defaults to GET |
| `url` | string | Yes | Target URL |
| `body` | string / nil | Conditional | Request body (binary-safe, required for POST/PUT/PATCH) |
| `headers` | table / nil | No | Optional key-value header pairs |
| `proxy` | string / nil | No | Proxy URL (e.g. `"http://user:pass@proxy:8080"`) |
| `timeout` | number / nil | No | Timeout in seconds (default: 30) |
| `max_body_size` | number / nil | No | Max response body in MB (integer, default: 10) |

## Returns

Same as [http_get](/lua-globals/http-get).

## Example

```lua
-- HEAD request (no body)
local res, err = http_request({ method = "HEAD", url = "https://example.com" })
if not res then
    log("head failed: " .. err.error)
    return
end

-- POST with JSON body through a proxy
local res, err = http_request({
    method = "POST",
    url = "https://api.example.com/data",
    body = '{"key":"value"}',
    headers = { ["Content-Type"] = "application/json" },
    proxy = "http://user:pass@residential-proxy:8080",
    timeout = 15
})
if not res then
    log("request failed: " .. err.kind)
    return
end
```

## See Also

- [http_get](/lua-globals/http-get) — Simple HTTP GET (no proxy/timeout)
- [http_post](/lua-globals/http-post) — Simple HTTP POST (no proxy/timeout)
- [http_multipart](/lua-globals/http-multipart) — Multipart form upload
