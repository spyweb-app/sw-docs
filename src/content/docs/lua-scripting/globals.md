---
title: Lua Globals
description: All Lua functions available in hooks.
sidebar:
  order: 4
---

The following globals are available in any hook function, `defer.lua`, and tests.

## HTTP Client

| Function | Async | Description |
|----------|-------|-------------|
| `http_get(url, [headers])` | ✅ | HTTP GET request. Returns `(res, err)` |
| `http_post(url, body, [headers])` | ✅ | HTTP POST request. Returns `(res, err)` |
| `http_request({ method, url, body?, headers?, proxy?, timeout?, max_body_size? })` | ✅ | Generic HTTP request |
| `http_multipart(url, fields, [headers])` | ✅ | Multipart file uploads |

All HTTP functions return `(response, nil)` on success or `(nil, error_table)` on failure. The response table has: `status`, `body`, `headers`, `url`, `time_ms`, `size`. The error table has: `error`, `kind`.

## File I/O

| Function | Async | Description |
|----------|-------|-------------|
| `fs_append(filename, content)` | ✅ | Append to a file in the job directory |
| `fs_overwrite(filename, content)` | ✅ | Overwrite a file in the job directory |
| `fs_read(filename)` | ✅ | Read a text file (returns string or nil), falls back to `shared/` |
| `fs_read_binary(filename)` | ✅ | Read a binary file, falls back to `shared/` |

Writes go to the job directory. Use `shared/` prefix for the project root's shared folder.

**Security:** Text operations are restricted to `.csv`, `.json`, `.jsonl`, `.txt`, and `.log`. `fs_read_binary` additionally supports `.png`, `.jpg`, `.gif`, `.svg`, `.pdf`, `.zip`, `.woff2`, etc. Absolute paths and `../` are prohibited.

## Storage

| Function | Async | Description |
|----------|-------|-------------|
| `store_set(key, value)` | ✅ | Set per-job storage key |
| `store_get(key)` | ✅ | Get per-job storage value |
| `store_delete(key)` | ✅ | Delete a per-job storage key |
| `global_store_set(key, value)` | ✅ | Set global (cross-job) storage key |
| `global_store_get(key)` | ✅ | Get global (cross-job) storage value |
| `global_store_incr(key, default, delta)` | ✅ | Atomically increment a global counter |
| `global_store_delete(key)` | ✅ | Delete a global storage key |

## Database (SQLite variant only)

| Function | Async | Description |
|----------|-------|-------------|
| `db_query(sql, [params])` | ✅ | Execute SELECT query, returns array of row tables |
| `db_exec(sql, [params])` | ✅ | Execute INSERT/UPDATE/DELETE, returns affected rows |

## Utilities

| Function | Async | Description |
|----------|-------|-------------|
| `sleep(ms)` | ✅ | Sleep for N milliseconds |
| `notify(title, body, [timeout])` | ✅ | Send desktop notification |
| `log(message)` | ✅ | Append timestamped line to `hook.log` |
| `json_encode(val)` | ❌ | Encode Lua value to JSON string |
| `json_decode(str)` | ❌ | Decode JSON string to Lua value (10MB input limit) |
| `env_get(key)` | ❌ | Read an environment variable |
| `defer(fn)` | ❌ | Register hook-scoped cleanup callback |
| `require(name)` | ❌ | Load a Lua module (Luau only, from job directory or project root) |
| `dump(value)` | ❌ | Pretty-print a Lua value |
| `copy(table)` | ❌ | Shallow copy of a Lua table |
| `deep_copy(table)` | ❌ | Deep copy of a Lua table |
