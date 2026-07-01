---
title: dump
description: Formats any Lua value into a readable string for debugging.
---

`dump(value)` formats any Lua value into a readable string. Handles nested tables, quotes strings, and marks circular references as `<cycle>` instead of recursing forever.

:::note
Especially useful for inspecting `fetch_result` or `ctx.last_fetch`.
:::

## Signature

```lua
dump(value)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">sync</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `value` | any | The Lua value to format |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| formatted | string | Human-readable representation of the value |

## Example

```lua
function after_fetch(fetch_result, ctx)
    print(dump(fetch_result))
    log(dump(ctx.last_fetch))
    return fetch_result
end
```

## See Also

- [log](/lua-globals/log) — Append to hooks.log file
- [json_encode](/lua-globals/json-encode) — Convert to JSON string
