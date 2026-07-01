---
title: require
description: Loads and executes a Lua module.
---

`require(module)` loads and executes a Lua module. **CWD-jailed**, searching the job's directory first, then falling back to the project root. Dots in module names convert to path separators (e.g. `foo.bar` → `foo/bar`). Modules are cached after first load.

:::note
The `io` library is disabled for security. Use `fs_append()`, `fs_overwrite()`, or `log()` for file operations.
:::

## Signature

```lua
require(module)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">sync</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `module` | string | Module name (dots converted to path separators) |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| result | any | Return value of the module |

## Example

```lua
-- In hooks.lua
local utils = require("utils")
local result = utils.process_data(data)
```

```lua
-- In utils.lua (same job directory)
local M = {}
function M.process_data(data)
    return data:upper()
end
return M
```

## See Also

- [Execution Lifecycle](/advanced-features/execution-lifecycle) — How modules are loaded
