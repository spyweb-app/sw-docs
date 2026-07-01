---
title: http_post
description: Performs an HTTP POST request.
---

`http_post(url, body, [headers])` performs an HTTP POST request. Returns `(response, nil)` on success or `(nil, error_table)` on failure.

:::note
Async and yields the Lua VM. Default timeout 30s, max response body 10MB. Default Content-Type is `application/x-www-form-urlencoded` unless overridden. Does not support proxy or timeout configuration, use `http_request` for that.
:::

## Signature

```lua
http_post(url, body, [headers])
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `url` | string | Target URL |
| `body` | string | Request body |
| `headers` | table? | Optional key-value header pairs |

## Returns

Same as [http_get](/lua-globals/http-get).

## Example

```lua
local res, err = http_post("https://api.example.com", '{"foo":"bar"}', {
    ["Content-Type"] = "application/json",
    ["Accept"] = "application/json"
})
if not res then
    log("post failed: " .. err.error)
    return
end
```

## See Also

- [http_get](/lua-globals/http-get) — HTTP GET request
- [http_request](/lua-globals/http-request) — Arbitrary HTTP request with proxy/timeout support
