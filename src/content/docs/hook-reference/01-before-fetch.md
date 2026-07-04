---
title: before_fetch
description: Modify the request before fetching, or skip the fetch entirely.
---

`before_fetch(request, ctx)` runs on the executor thread before every HTTP request. Modify the URL, add headers, or return `nil` to skip this run entirely.

## Signature

```lua
function before_fetch(request, ctx) -> table | nil
```

## Parameters

| Field | Type | Mutable | Description |
|-------|------|---------|-------------|
| `request.url` | string | yes | Target URL |
| `request.method` | string | yes | HTTP method (`GET`, `HEAD`, `DELETE`, etc.) |
| `request.headers` | table | yes | HTTP headers (string→string) |
| `request.timeout` | number / nil | yes | Per-request timeout in seconds (default: 30) |
| `request.proxy` | string / nil | yes | Per-request proxy URL (overrides job proxy config) |
| `request.max_body_size` | number / nil | yes | Max response body in MB (integer, default: 10) |

## Returns

| Return | Effect |
|--------|--------|
| request table | Continue with modified request |
| `nil` / `false` | Skip this entire run |

## Example

```lua
function before_fetch(request, ctx)
    request.headers["Authorization"] = "Bearer my-token"
    return request
end
```

```lua
function before_fetch(request, ctx)
    page = page or 1
    request.url = request.url .. "?page=" .. page
    page = page + 1
    if page > 10 then page = 1 end
    return request
end
```

## See Also

- [override_fetch](/hook-reference/02-override-fetch) - Replace the entire fetch with custom logic
- [after_fetch](/hook-reference/03-after-fetch) - Process the response after fetching
