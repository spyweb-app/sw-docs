---
title: notify
description: Sends a desktop notification immediately from Lua.
---

`notify(title, body, [timeout_ms])` sends a desktop notification immediately. Thin wrapper around SpyWeb's native notification sender, usable from any hook including error paths.

:::note
Desktop notifications are typically unavailable on servers, cloud hosts, containers, and other headless environments. In those cases `notify(...)` silently skips the notification and logs the underlying OS/backend error.
:::

## Signature

```lua
notify(title, body, [timeout_ms])
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `title` | string | Notification title |
| `body` | string | Notification body text |
| `timeout_ms` | number? | Optional timeout in milliseconds (default: 5000) |

## Returns

None.

## Example

```lua
function after_fetch(fetch_result, ctx)
    if not fetch_result.ok then
        notify("Network error", fetch_result.error.message, 10000)
        return nil
    end
    return fetch_result
end
```

## See Also

- [log](/lua-globals/log) — Append to hooks.log file
