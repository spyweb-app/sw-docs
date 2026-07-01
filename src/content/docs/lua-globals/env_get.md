---
title: env_get
description: Retrieves a read-only environment variable from the host system.
---

`env_get(key)` retrieves a read-only environment variable from the host system. Automatically prepends the `SPYWEB_` prefix for security, allowing you to store secrets outside config files.

:::note
To access a variable in Lua, you must prefix it with `SPYWEB_` on your host system:

```bash
export SPYWEB_API_KEY="secret-123"
```

Then in Lua, call `env_get("API_KEY")`.
:::

## Signature

```lua
env_get(key)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">sync</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `key` | string | Environment variable name (without `SPYWEB_` prefix) |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| value | string / nil | Environment variable value, or nil if not set |

## Example

```lua
function before_fetch(request, ctx)
    local api_key = env_get("API_KEY") -- Reads SPYWEB_API_KEY
    if api_key then
        request.headers["Authorization"] = "Bearer " .. api_key
    end
    return request
end
```

## See Also

- [before_fetch](/hook-reference/01-before-fetch) — Modify request before fetching
