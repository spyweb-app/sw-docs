---
title: CLI Commands
description: How to run, debug, test, and manage SpyWeb from the command line.
sidebar:
  order: 1
---

SpyWeb ships as two separate binaries to provide the best experience for your environment:

1. **Terminal Version (`spyweb`)** — Best for headless servers, VPS, and cloud environments. Runs in the terminal and outputs real-time logs for monitoring and debugging.
2. **Silent Tray Version (`spyweb-tray`)** — Best for desktop use. Runs in the background without a terminal window and provides quick access via a system tray icon.

A typical workflow is to use the **Terminal Version** for your initial setup, debugging Lua hooks, and verifying selectors. Once you are happy with the results, switch to the **Tray Version** to let it run silently in the background.

## Starting the Engine

To start the monitoring engine on all enabled jobs:

```bash
./spyweb start
```

You can customize the port for the dashboard and API using the `--port` flag or the `SPYWEB_PORT` environment variable (default is 7979):

```bash
./spyweb start --port 9000
# or
SPYWEB_PORT=9000 ./spyweb start
```

## Debugging Jobs

The `debug` command is ideal for iterative development and testing your scraping configuration:

```bash
./spyweb debug "My Job Name"
```

The debug command has several special behaviors:
- **Ignores `enabled` flag** — runs the job even if set to `enabled = false`
- **Instant Feedback** — prints extracted items directly to your terminal
- **Pipeline Transparency** — shows core pipeline stages up to `before_store`
- **Saves Artifacts** — generates response HTML and JSON fields in the job folder for inspection

## Running Tests

SpyWeb includes a test runner for `test_*` functions defined in your Lua hooks. Each test runs in an isolated Lua VM with a temporary database.

```bash
# Run all tests across all jobs
./spyweb test

# Run all tests from a specific job
./spyweb test "My Job Name"

# Run tests matching a specific pattern in a job
./spyweb test "My Job Name" price
```

## Health Checks & Validation

```bash
# Full health check: version, config validation, and update availability
./spyweb check

# Config-only validation (parses jobs, checks Lua syntax, no code execution)
./spyweb check config

# Update-only check (fetch latest version info)
./spyweb check update
```

## Updating SpyWeb

The CLI includes built-in commands to update the engine seamlessly:

```bash
# Check for updates, download, and replace binary (keeps old as spyweb-v{version})
./spyweb update

# Dry-run: check for updates without downloading
./spyweb update --check

# Skip version check, always download and replace
./spyweb update --force

# Keep old binary with custom suffix
./spyweb update --keep          # spyweb-v{version}
./spyweb update --keep backup   # spyweb-backup

# Discard old binary entirely
./spyweb update --overwrite
```

## Browser Profile Management

If you are using CDP browser automation, SpyWeb manages browser profiles for you. You can inspect or clear these from the CLI:

```bash
# Check profile status for a job (all jobs if no name given)
./spyweb profile check "My Job"
./spyweb profile list

# Wipe browser caches (keeps the profile, clears cookies/cache)
./spyweb profile clear all
./spyweb profile clear "My Job"

# Delete profile directories entirely
./spyweb profile delete all
./spyweb profile delete "My Job"
```

## Editor Support

To generate Lua LSP type definitions for your editor (which helps with autocomplete for SpyWeb globals and hooks):

```bash
./spyweb types
```

## Version Info

Check your current engine version, active Lua runtime, and storage backend:

```bash
./spyweb version
```
