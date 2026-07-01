---
title: log
description: Appends a timestamped line to hooks.log.
---

`log(message)` appends a timestamped line to `hooks.log` in the job's directory (or `server.log` for API server context).

:::note
This is the recommended way to debug hooks without using external libraries. You can also use `print()` instead to see output directly in the terminal.
:::

## Signature

```lua
log(message)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `message` | string | The message to append |

## Returns

None.

## Example

```lua
local items = extract_items(page)
log("extracted " .. #items .. " items")
```

## See Also

- [notify](/lua-globals/notify) — Send desktop notifications
- [dump](/lua-globals/dump) — Format values for debugging
