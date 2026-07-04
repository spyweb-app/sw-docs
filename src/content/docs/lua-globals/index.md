---
title: Overview
description: Reference for all Lua functions available in SpyWeb hooks.
---

SpyWeb injects several global helper functions into the Lua environment for networking, storage, file I/O, JSON handling, and utilities.

Unlike languages where async requires `await` or `.then()`, the `async`/`sync` difference here is purely technical and usually only matters inside `defer`. The only difference is that `async` bindings yield the Lua VM and won't block the thread while waiting for I/O, while `sync` bindings run to completion without yielding.

- **async** - frees the thread to run other tasks while waiting for I/O or network response. Your hook appears to block, but the runtime stays responsive.
- **sync** - holds the thread until the binding finishes; only used for instant operations like computation or simple reads where holding the thread is not a concern.

## HTTP Client

- [http_get](http_get/) - HTTP GET request
- [http_post](http_post/) - HTTP POST request
- [http_request](http_request/) - Generic HTTP request with full control
- [http_multipart](http_multipart/) - Multipart file uploads

## Database (SQLite variant only)

- [db_query](db_query/) - Execute SELECT queries
- [db_exec](db_exec/) - Execute INSERT/UPDATE/DELETE

## JSON

- [json_encode](json_encode/) - Encode Lua value to JSON string
- [json_decode](json_decode/) - Decode JSON string to Lua value

## File I/O

- [fs_append](fs_append/) - Append to a file
- [fs_overwrite](fs_overwrite/) - Overwrite a file
- [fs_read](fs_read/) - Read a text file
- [fs_read_binary](fs_read_binary/) - Read a binary file

## Storage

- [storage](storage/) - Persistent key-value storage (job-scoped and global)

## Utilities

- [defer](defer/) - Register hook-scoped cleanup callback
- [dump](dump/) - Pretty-print a Lua value
- [copy](copy/) - Shallow copy of a table
- [deep_copy](deep_copy/) - Deep copy of a table
- [notify](notify/) - Send desktop notification
- [log](log/) - Append to hooks.log
- [sleep](sleep/) - Sleep for N milliseconds
- [env_get](env_get/) - Read an environment variable
- [require](require/) - Load a Lua module
