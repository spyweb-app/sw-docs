---
title: deep_copy
description: Returns a deep, recursive copy of a table.
---

`deep_copy(table)` returns a deep, recursive copy of a table. Every nested table is cloned, ensuring total isolation from the original. Safely handles circular references.

## Signature

```lua
deep_copy(table)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">sync</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `table` | table | The table to copy |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| deep | table | A deep copy (every nested table is cloned) |

## Example

```lua
local original = { a = 1, b = { c = 2 } }
local deep = deep_copy(original)
deep.b.c = 99 -- original.b.c remains 2
```

## See Also

- [copy](/lua-globals/copy) — Shallow copy (first level only)
