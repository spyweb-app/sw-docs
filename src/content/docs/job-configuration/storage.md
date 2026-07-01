---
title: Storage Backends
description: redb (KV) vs SQLite backend comparison.
sidebar:
  order: 2
---

SpyWeb is designed to be self-contained and portable, requiring no external database server like PostgreSQL or MySQL. It uses an embedded database stored in a single `data` file. Choose between two backends at download time.

## At a Glance

| Feature | KV (redb, default) | SQL (SQLite) |
|---------|--------------------|--------------|
| Binary Size | ~7MB | ~7MB |
| Philosophy | Minimalist & Zero-Configuration | Transparent & Queryable |
| Performance | High (Low overhead) | Moderate (WAL optimized) |
| External Access | None (Internal format) | Any SQLite tool |
| Lua SQL Support | No | Yes (`db_query`, `db_exec`) |
| Concurrency | Multi-reader, Single-writer | Serialized (Mutex) |
| Data Format | Key-Value (B-Tree) | Relational (SQL) |

## redb (Default)

High-performance, type-safe embedded key-value store.

**When to use it:**
- Zero-maintenance, hands-off storage
- Only need data in the Web Dashboard or Webhooks
- Don't need custom SQL queries
- Prefer an internal-only data format

**File:** `data` (single binary file in working directory)
**Format:** JSON strings keyed by `(job_id, reversed_timestamp)`

## SQLite (Full Database Control)

Available in the `-sql` build variants.

**When to use it:**
- Total control over data structure with custom tables
- Use external tools (DBeaver, TablePlus, sqlite3)
- Complex Lua logic with raw SQL (JOINs, aggregations)
- Store and relate scraped data with custom state

**Files:** `data`, `data-wal` (WAL), `data-shm` (Shared Memory)
**Performance:** Configured with `PRAGMA journal_mode=WAL` and `PRAGMA synchronous=NORMAL`

### Database Schema

Three primary tables:

1. **`records`** — `job_id` (string), `rev_ts` (nanosecond timestamp, records ordered newest-first), `json` (full record as JSON)
2. **`seen`** — Deduplication hashes for avoiding duplicate records
3. **`lua_user`** — Persistent key-value state backing `store_*` / `global_store_*`

### Lua SQL Bindings

- `db_query(sql, [params])` — Executes a SELECT statement and returns an array of tables
- `db_exec(sql, [params])` — Executes any SQL statement (INSERT, UPDATE, DELETE, CREATE) and returns the number of rows affected

```lua
-- db_query: SELECT, returns array of tables
local rows = db_query("SELECT json FROM records WHERE job_id = ? LIMIT 5", { "my-job" })
for _, row in ipairs(rows) do
    local data = json_decode(row.json)
    print(data.title)
end

-- db_exec: any SQL, returns rows affected
db_exec([[
    CREATE TABLE IF NOT EXISTS markers (
        id TEXT PRIMARY KEY,
        val INTEGER
    )
]])

function on_finished()
    db_exec("INSERT OR REPLACE INTO markers (id, val) VALUES (?, ?)", { "last_page", 10 })
end
```

### Shared Task Queue Example

Use a database table as a shared work queue across multiple workers. A dedicated "Discovery" job can populate the queue for other jobs to process.

**1. Initialize the Schema** — `CREATE TABLE IF NOT EXISTS queue` ensures the table exists on every load:

```lua
-- Top-level: runs once at load time (startup/reload)
db_exec([[
    CREATE TABLE IF NOT EXISTS queue (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        status TEXT DEFAULT 'pending'
    )
]])

-- For fresh databases, seed with initial URLs
db_exec([[
    INSERT OR IGNORE INTO queue (id, url) VALUES
        ('task-1', 'https://example.com/page/1'),
        ('task-2', 'https://example.com/page/2')
]])
```

**2. Worker Pick & Lock** — Each worker atomically claims the next pending task:

```lua
function before_fetch(request, ctx)
    local rows = db_query([[
        UPDATE queue SET status = 'processing'
        WHERE id = (SELECT id FROM queue WHERE status = 'pending' LIMIT 1)
        RETURNING id, url
    ]])
    if #rows == 0 then return nil end
    request.url = rows[1].url
    ctx.shared.current_task_id = rows[1].id
    return request
end
```

**3. Mark Completion** — Track success or failure per task:

```lua
function on_finally(ctx)
    local task_id = ctx.shared.current_task_id
    if not task_id then return end
    local final_status = ctx.telemetry.map.fetch.status == "success" and "completed" or "failed"
    db_exec("UPDATE queue SET status = ? WHERE id = ?", { final_status, task_id })
end
```

## Limitations

**The two backends are not binary compatible.** You cannot point the redb version at an SQLite `data` file or vice versa. Export/import manually if switching.
