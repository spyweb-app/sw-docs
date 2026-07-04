---
title: override_fetch
description: Replace the built-in HTTP client with a custom fetch implementation.
---

`override_fetch(request, ctx)` completely replaces SpyWeb's internal HTTP client. Use this when you need custom fetching, like launching a Chrome instance via CDP or using a proxy rotater.

## Signature

```lua
function override_fetch(request, ctx) -> table 
```

## Parameters

Same as [before_fetch](/hook-reference/01-before-fetch#parameters).

## Returns

| Return | Effect |
|--------|--------|
| `response` object | A standard response table (`{ status = 200, body = "...", url = "..." }`). Output acts exactly like a native fetch result and will still pass through `after_fetch` if defined. |
| `{ error = "msg" }` | Simulate a network failure |
| `nil` or `false` | **Causes a pipeline error** ("must return a response table"). Unlike other hooks, nil/false does NOT mean skip — this hook must always return a response table or an error table. |

## Example

```lua
function override_fetch(request, ctx)
    local res, err = http_get("http://my-renderer.local/?url=" .. request.url)
    if not res then
        return { error = "renderer request failed: " .. err.error }
    end
    return {
        status = res.status,
        url = request.url,
        body = res.body,
        headers = res.headers
    }
end
```

## See Also

- [before_fetch](/hook-reference/01-before-fetch) - Modify the request (but still use built-in fetch)
- [after_fetch](/hook-reference/03-after-fetch) - Process the response after fetching
