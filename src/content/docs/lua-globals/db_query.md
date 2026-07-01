---
title: db_query
description: Executes a SELECT query on the SQLite database.
---

`db_query(sql, [params])` executes a SELECT query on the SQLite database. Returns an array of row-tables with column-value pairs.

:::note
Available only on the **SQL (SQLite)** build variant. Integer/Real/Text/Null SQL types map to Lua number/string/nil. On the **KV (redb)** variant, calling this returns a clear error directing you to download the SQLite build.
:::

## Signature

```lua
db_query(sql, [params])
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">async</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `sql` | string | The SQL SELECT statement |
| `params` | table? | Optional array of positional parameters for prepared statements (`?` placeholders) |

## Returns

| Value | Type | Description |
|-------|------|-------------|
| rows | array | Array of row tables with column-value pairs |

## Example

```lua
local rows = db_query("SELECT json FROM records WHERE job_id = ? LIMIT 5", { "my-job" })
for _, row in ipairs(rows) do
    local data = json_decode(row.json)
    log("Title: " .. data.title)
end
```

## See Also

- [db_exec](/lua-globals/db-exec) — Execute INSERT/UPDATE/DELETE statements
