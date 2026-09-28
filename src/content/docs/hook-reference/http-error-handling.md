---
title: HTTP Error Handling
description: How SpyWeb classifies HTTP responses as success or failure across bindings and pipeline hooks.
sidebar:
  order: 2
---

SpyWeb has two layers that handle HTTP responses differently: **HTTP bindings** (user-facing APIs) and the **pipeline** (internal hooks). They have different definitions of "success" because they serve different purposes.

## Two Layers, Different Purposes

| Layer | Purpose | Success = |
|-------|---------|-----------|
| HTTP bindings (`http_get`, etc.) | User scripts make arbitrary requests | Any HTTP response received |
| Pipeline (`after_fetch`) | Internal classification for reporting/logging | 2xx status code only |

**Why the difference?** HTTP bindings are user-facing — you might want to inspect a 404 response body or read rate-limit headers. The pipeline needs to classify responses for telemetry and flow control.

## HTTP Bindings

**Success = any HTTP response received** (even 4xx/5xx).

| Scenario | Result |
|----------|--------|
| 200 OK | `(response, nil)` — success |
| 404 Not Found | `(response, nil)` — success |
| 500 Server Error | `(response, nil)` — success |
| DNS failure | `(nil, error_table)` — failure |
| Timeout | `(nil, error_table)` — failure |
| Connection refused | `(nil, error_table)` — failure |

A 404 is a valid HTTP response — the server responded. Only network-level errors (DNS, timeout, TLS, connection) are failures.

```lua
local res, err = http_get("https://api.example.com/missing")
if not res then
    -- Only enters here on network errors (DNS, timeout, etc.)
    -- NOT on 404 — that's a valid response
    log("network error: " .. err.kind)
    return
end

-- res.status could be 200, 404, 500, etc.
if res.status >= 400 then
    log("HTTP error: " .. res.status)
    log("Body: " .. res.body)
end
```

## Pipeline (`after_fetch`)

**Success = 2xx only.**

| Scenario | `ok` | `response` | `error` |
|----------|------|------------|---------|
| 200 OK | `true` | Full response | `nil` |
| 404 Not Found | `false` | Full response (body, headers, etc.) | `{message: "http status: 404", kind: "http"}` |
| 500 Server Error | `false` | Full response | `{message: "http status: 500", kind: "http"}` |
| DNS failure | `false` | `nil` | `{message: "dns lookup failed", kind: "dns"}` |

Key difference from HTTP bindings: a 404 arrives as `ok: false` with both `response` AND `error` present. A network error has `response: nil`.

```lua
function after_fetch(fetch_result, ctx)
    if not fetch_result.ok then
        -- Enters here for 4xx, 5xx, AND network errors
        if fetch_result.response then
            -- HTTP error (4xx/5xx) — response is available
            log("HTTP error: " .. fetch_result.response.status)
            log("Body: " .. fetch_result.response.body)
        else
            -- Network error — no response
            log("Network error: " .. fetch_result.error.kind)
        end
        return nil
    end
    return fetch_result
end
```

## Error Kind Classification

Network errors are classified by the `error_kind` function based on error message keywords:

| `kind` | Trigger | Example message |
|--------|---------|-----------------|
| `"http"` | `"http status:"` | `"http status: 404"` |
| `"dns"` | `"dns"`, `"resolve"` | `"dns lookup failed"` |
| `"timeout"` | `"timed out"`, `"timeout"` | `"connection timed out"` |
| `"tls"` | `"tls"`, `"certificate"` | `"tls certificate expired"` |
| `"proxy"` | `"proxy"` | `"proxy connection refused"` |
| `"connect"` | `"connect"`, `"connection"` | `"connection refused"` |
| `"size"` | `"exceeds"` | `"response size exceeds limit"` |
| `"unknown"` | fallback | any other error |

## Summary

| Scenario | HTTP bindings | Pipeline (`after_fetch`) |
|----------|---------------|--------------------------|
| 200 OK | Success | `ok: true` |
| 404 Not Found | **Success** (has response) | `ok: false` (has response + error) |
| 500 Server Error | **Success** (has response) | `ok: false` (has response + error) |
| DNS error | Failure (`nil, err`) | `ok: false` (no response, has error) |
| Timeout | Failure (`nil, err`) | `ok: false` (no response, has error) |

## See Also

- [after_fetch](/hook-reference/03-after-fetch) - Pipeline hook reference
- [http_get](/lua-globals/http_get) - HTTP GET request
- [http_post](/lua-globals/http_post) - HTTP POST request
- [http_request](/lua-globals/http_request) - Arbitrary HTTP request
- [http_multipart](/lua-globals/http_multipart) - Multipart form upload
