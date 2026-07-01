---
title: copy
description: Returns a shallow copy of a table.
---

`copy(table)` returns a shallow copy of a table. Only the first level of keys and values are copied. Nested tables are still shared by reference.

## Signature

```lua
copy(table)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">sync</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `table` | table | The table to copy |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| shallow | table | A shallow copy (only first level is copied) |

## Example

```lua
local original = { a = 1, b = { c = 2 } }
local shallow = copy(original)
shallow.a = 99 -- original.a is still 1
shallow.b.c = 99 -- original.b.c IS now 99
```

## See Also

- [deep_copy](/lua-globals/deep-copy) — Recursive deep copy
