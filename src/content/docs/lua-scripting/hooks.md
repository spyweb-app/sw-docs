---
title: Hook Reference
description: Technical contracts for every pipeline hook.
sidebar:
  order: 2
---

## What is `ctx`?

Every hook receives a per-cycle context table as its second argument. `ctx` is a scratch table created fresh for each scrape cycle and discarded at the end. Use it to pass data between hooks within the same cycle.

Reserved fields set by the engine:

- `ctx.last_fetch` — FetchAttempt envelope with `request`, `ok`, `response` (on success), and `error` (on failure)
- `ctx.selector_matches` — Number of CSS selector hits
- `ctx.telemetry` — Performance telemetry for the cycle
- `ctx.shared` — A table shared across all hooks in the cycle

## 1. `before_fetch(request, ctx)`

Called before every HTTP request. Modify the URL, add headers, or skip entirely.

**Request fields:**

| Field | Type | Mutable | Description |
|-------|------|---------|-------------|
| `request.url` | string | ✅ | Target URL |
| `request.method` | string | ✅ | HTTP method (GET, HEAD, DELETE, etc.) |
| `request.headers` | table | ✅ | HTTP headers (string → string) |
| `request.timeout` | number / nil | ✅ | Per-request timeout in seconds (default: 30) |
| `request.proxy` | string / nil | ✅ | Per-request proxy URL (overrides job proxy config) |
| `request.max_body_size` | number / nil | ✅ | Max response body in MB (integer, default: 10) |

**Return values:**

| Return | Effect |
|--------|--------|
| request table | Continue with modified request |
| `nil` / `false` | Skip this entire run |

```lua
function before_fetch(request, ctx)
    request.headers["Authorization"] = "Bearer my-token"
    return request
end
```

Pagination example:

```lua
function before_fetch(request, ctx)
    page = page or 1
    request.url = request.url .. "?page=" .. page
    page = page + 1
    if page > 10 then page = 1 end
    return request
end
```

## 2. `override_fetch(request, ctx)`

Overrides the fetch phase. If defined, SpyWeb will NOT use its internal HTTP client.

| Return | Effect |
|--------|--------|
| response object | Acts as a native fetch result, passes through `after_fetch` |
| `{ error = "msg" }` | Simulates a network failure |

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

## 3. `after_fetch(fetch_result, ctx)`

Called after every fetch attempt. Receives a stable envelope with request context and either a response or error snapshot.

**Envelope fields:**

| Field | Type | Mutable | Description |
|-------|------|---------|-------------|
| `fetch_result.ok` | boolean | ❌ | `true` on HTTP 2xx success |
| `fetch_result.request.url` | string | ❌ | Attempted request URL |
| `fetch_result.request.headers` | table | ❌ | Request headers after `before_fetch` |
| `fetch_result.request.proxy` | string / nil | ❌ | Selected proxy for this attempt |
| `fetch_result.response` | table | ❌ | Present when a real HTTP response exists |
| `fetch_result.response.body` | string | ✅ | Response body on success |
| `fetch_result.response.status` | number | ❌ | HTTP status code |
| `fetch_result.response.url` | string | ❌ | Final response URL |
| `fetch_result.response.headers` | table | ❌ | Response headers |
| `fetch_result.response.proxy` | string / nil | ❌ | Proxy URL used |
| `fetch_result.response.time_ms` | number / nil | ❌ | Total request time in ms |
| `fetch_result.response.size` | number / nil | ❌ | Response body size in bytes |
| `fetch_result.error.message` | string | ❌ | Error message on fetch failure |
| `fetch_result.error.kind` | string | ❌ | Error category: `dns`, `timeout`, etc. |

**Return values:**

| Return | Effect |
|--------|--------|
| table | Continue. On success only `response.body` is taken back |
| `nil` / `false` | Skip extraction for this run |

```lua
function after_fetch(fetch_result, ctx)
    if not fetch_result.ok then
        notify("Fetch failed", fetch_result.error.message, 8000)
        return nil
    end
    -- Strip unwanted content
    fetch_result.response.body = fetch_result.response.body:gsub("&lt;script.-&lt;/script>", "")
    return fetch_result
end
```

## 4. `override_extract(response, ctx)`

Overrides the extraction phase. If defined, SpyWeb will NOT use its internal HTML/CSS scraper.

| Return | Effect |
|--------|--------|
| Array of items | Items use `{ fields = { ... } }` structure. Keys must match `fields` in config |

```lua
function override_extract(response, ctx)
    local data = json_decode(response.body)
    local items = {}
    for i, post in ipairs(data.posts) do
        table.insert(items, {
            fields = {
                author = post.user.name,
                message = post.content
            }
        })
    end
    return items
end
```

**Note on Matches:** The `matches` field is immutable and system-owned. The engine auto-populates it by scanning your returned `fields` against the job's keywords.

## 5. `after_extract(items, ctx)`

Batch hook — receives all extracted items at once. Good for cross-item logic, dedup, or sorting.

```lua
function after_extract(items, ctx)
    local seen = {}
    local unique = {}
    for _, item in ipairs(items) do
        local title = item.fields.title or ""
        if not seen[title] and title ~= "" then
            seen[title] = true
            table.insert(unique, item)
        end
    end
    return unique
end
```

## 6. `filter_item(item, ctx)`

Per-item filter. Replaces built-in keyword filter if defined.

| Return | Effect |
|--------|--------|
| item table | Keep this item |
| `nil` / `false` | Drop this item |

```lua
function filter_item(item, ctx)
    if item.fields.price and tonumber(item.fields.price) > 100 then
        return item
    end
    return nil
end
```

## 7. `before_store(items, ctx)`

Last chance before database insert. Return `nil` to skip store, notification, and webhook.

```lua
function before_store(items, ctx)
    for _, item in ipairs(items) do
        item.fields.stored_at = os.date("%Y-%m-%dT%H:%M:%S")
    end
    return items
end
```

## 8. `before_notify(items, ctx)`

Reshape or silence desktop notifications. Items are already stored at this point.

| Return | Effect |
|--------|--------|
| items table | Send notification with these items |
| `nil` / `false` | Silence notification |

## 9. `before_webhook(payload, ctx)`

Reshape or silence webhook POSTs. Receives the full JSON payload table.

| Return | Effect |
|--------|--------|
| payload table | Send webhook with reshaped payload |
| `nil` / `false` | Silence webhook |

```lua
function before_webhook(payload, ctx)
    return {
        text = "Found " .. payload.item_count .. " new items from " .. payload.job_name,
        items = payload.items
    }
end
```

## 10. `on_finished()`

Runs after every complete job iteration (all workers done, before sleep). Receives no arguments.

```lua
function on_finished()
    log("Job iteration complete")
end
```
