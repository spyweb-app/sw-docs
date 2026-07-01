---
title: Lua Testing
description: Writing and running Lua tests for job hooks.
sidebar:
  order: 5
---

SpyWeb includes a lightweight Lua testing mode for job hooks. Tests are kept close to production logic while running in fresh, isolated Lua VMs.

## CLI Usage

```bash
spyweb test
spyweb test "Job Name"
spyweb test "Job Name" price
```

- `spyweb test` — runs every `test_*` function across all jobs
- `spyweb test "Job Name"` — runs tests for the matching job
- `spyweb test "Job Name" price` — runs tests whose name contains "price"

## Test Discovery

SpyWeb loads `hooks.lua`, `defer.lua`, and `tests.lua` from the job directory, then scans for global functions starting with `test_`.

```lua
function extract_id(text)
    return text:match("ID%-(%d+)")
end

function test_extract_id()
    spyweb.assert_eq(extract_id("Product ID-9982"), "9982")
end
```

## Execution Model

Each test function runs in its own fresh Lua VM:
- Global mutations don't leak between tests
- Each test gets a new temporary **Redb** database
- `defer.lua` is loaded alongside `hooks.lua` and `tests.lua`, so tests see the same lifecycle helpers as production
- Production Lua bindings are available (HTTP bindings are async under the hood — the test runner executes them asynchronously)
- Production `ctx` is registered as `active_ctx`

## Available Bindings

- `http_get`, `http_post`, `http_request`, `http_multipart`
- `fs_read`, `fs_read_binary`, `store_*`, `global_store_*`
- `spyweb.assert_eq(left, right, [message])`
- `spyweb.assert_ne(left, right, [message])`

### Example: HTTP Test

```lua
function test_fetch_remote_page()
    local res = http_get("http://127.0.0.1:8080/")
    spyweb.assert_eq(res.status, 200)
    spyweb.assert_eq(res.body, "OK")
end

function test_head_request()
    local res = http_request({ method = "HEAD", url = "http://127.0.0.1:8080/" })
    spyweb.assert_eq(res.status, 200)
    spyweb.assert_eq(res.body, "")
end
```

### Example: Storage Seed

```lua
function test_seed_state()
    store_set("page", "3")
    spyweb.assert_eq(store_get("page"), "3")
end
```

## Mocking

Tests can overwrite globals inside the Lua VM:

```lua
function test_override_fetch_logic()
    override_fetch = function(req, ctx)
        return { status = 200, body = "mock", url = req.url }
    end
    local result = override_fetch({ url = "https://example.com" })
    spyweb.assert_eq(result.body, "mock")
end
```

## Assert Helpers

- `spyweb.assert_eq(left, right, [message])` — passes if `left == right`. The optional `message` is included in failure output.
- `spyweb.assert_ne(left, right, [message])` — passes if `left ~= right`.

## Practical Limits

- **Name-based discovery** — matches by job name or normalized job id
- **Only globals** — `local` functions are not visible to the test runner
- **Isolated VMs** — each test runs in its own VM; globals do not leak between tests
- **defer lifecycle** — `defer()` works as in production; registered cleanup runs when the test finishes

## Recommended Structure

For small jobs — keep tests in `hooks.lua` next to the hook they verify.

For larger jobs:

```
project/
├── jobs/
│   └── inventory-sync/
│       ├── hooks.lua        # Production hooks
│       ├── defer.lua         # Lifecycle helpers
│       └── tests.lua         # Shared helpers and broader test cases
```

### Example Suite

**`hooks.lua`** — production hook and helper:

```lua
function extract_id(text)
    return text:match("ID%-(%d+)")
end

function override_fetch(req, ctx)
    -- production logic
end
```

**`tests.lua`** — shared helper and test cases:

```lua
-- shared helper
function make_test_request(url)
    return http_request({ method = "GET", url = url })
end

function test_extract_id()
    spyweb.assert_eq(extract_id("ID-001"), "001")
end

function test_fetch_reachable()
    local res = make_test_request("http://127.0.0.1:8080/")
    spyweb.assert_eq(res.status, 200)
end
```

## Failure Output

```
running 1 test for job 'inventory-sync'
test test_id_extraction ... FAILED

failures:

---- test_id_extraction stdout ----
...

test result: FAILED. 0 passed; 1 failed; finished in 0.01s
```

## Troubleshooting

**No tests found:** Ensure function name starts with `test_`, is global (not `local`), and is in `hooks.lua`, `defer.lua`, or `tests.lua`.

**HTTP test fails:** Confirm URL is reachable. Each test runs in a fresh VM.

**A helper defined in `defer.lua` is missing:** Verify the filename is `defer.lua` (not `defer.luau`) and it is placed next to `hooks.lua`.
