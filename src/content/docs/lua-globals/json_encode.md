---
title: json_encode
description: Converts a Lua table or value into a JSON string.
---

`json_encode(table)` converts a Lua table or value into a JSON string. Uses SpyWeb's built-in high-performance JSON engine, handling nested tables, arrays, booleans, and nulls automatically.

## Signature

```lua
json_encode(table)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">sync</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `table` | any | The Lua value to encode |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| json | string | JSON-encoded string |

## Example

```lua
local payload = {
    url = "https://example.com",
    options = { waitUntil = "networkidle2" }
}
local body = json_encode(payload)
local resp = http_post("https://api.rendering-service.com/render", body, {["Content-Type"]="application/json"})
```

## See Also

- [json_decode](/lua-globals/json-decode) — Parse JSON string to Lua table
