---
title: after_fetch
description: Inspect success or failure, mutate body on success, or return a synthetic response.
---

`after_fetch(fetch_result, ctx)` runs after every fetch attempt. It receives a stable envelope with request context, plus either a response snapshot or an error snapshot. On successful fetches, only `response.body` is accepted back into the pipeline. On failed fetches, Lua may return a full synthetic `response` table to continue extraction anyway.

## Signature

```lua
function after_fetch(fetch_result, ctx) -> table | nil
```

## Parameters

| Field | Type | Mutable | Description |
|-------|------|---------|-------------|
| `fetch_result.ok` | boolean | no | `true` on HTTP 2xx success, `false` on transport failures and HTTP error responses |
| `fetch_result.request.url` | string | no | Attempted request URL |
| `fetch_result.request.headers` | table | no | Request headers after `before_fetch` |
| `fetch_result.request.proxy` | string / nil | no | Selected proxy for this attempt |
| `fetch_result.response` | table | no | Present when a real HTTP response exists, including HTTP errors like 403/500 |
| `fetch_result.response.body` | string | yes | Response body on success |
| `fetch_result.response.status` | number | no | HTTP status code on success |
| `fetch_result.response.url` | string | no | Final response URL on success |
| `fetch_result.response.headers` | table | no | Response headers on success |
| `fetch_result.response.proxy` | string / nil | no | Proxy URL used for this request (if any) |
| `fetch_result.response.time_ms` | number / nil | no | Total request time in milliseconds |
| `fetch_result.response.size` | number / nil | no | Response body size in bytes |
| `fetch_result.error.message` | string | no | Error message on fetch failure |
| `fetch_result.error.kind` | string | no | Best-effort error category like `dns` or `timeout` |

## Returns

| Return | Effect |
|--------|--------|
| table | Continue. On success only `response.body` is taken back; on failure a full `response` can be synthesized |
| `nil` / `false` | Skip extraction for this run |

## Example

```lua
function after_fetch(fetch_result, ctx)
    if not fetch_result.ok then
        if fetch_result.response then
            print("HTTP error: " .. fetch_result.response.status)
        end
        notify("Fetch failed", fetch_result.error.message, 8000)
        return nil
    end

    if fetch_result.response.status ~= 200 then
        print("Bad status: " .. fetch_result.response.status)
        return nil  -- skip extraction
    end

    -- Strip unwanted content from the body
    fetch_result.response.body = fetch_result.response.body:gsub("<script.-</script>", "")
    return fetch_result
end
```

## See Also

- [before_fetch](/hook-reference/before-fetch) — Modify the request before fetching
- [override_fetch](/hook-reference/override-fetch) — Replace the entire fetch with custom logic
