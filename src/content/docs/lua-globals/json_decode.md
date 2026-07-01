---
title: json_decode
description: Parses a JSON string into a native Lua table.
---

`json_decode(string)` parses a JSON string into a native Lua table. Returns `nil` and logs an error if the JSON is malformed.

:::note
Input must be under 10MB. Returns an error if exceeded.
:::

## Signature

```lua
json_decode(string)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">sync</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `string` | string | The JSON string to parse |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| table | table / nil | Parsed Lua table, or nil on malformed JSON |

## Example

```lua
local data = json_decode('{"status": "ok", "count": 42}')
log("Status is: " .. data.status)
```

## See Also

- [json_encode](/lua-globals/json-encode) — Convert Lua table to JSON string
