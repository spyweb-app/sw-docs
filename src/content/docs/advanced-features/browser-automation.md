---
title: Browser Automation (CDP)
description: Headless browser automation via Chrome DevTools Protocol.
sidebar:
  order: 1
---

SpyWeb does not bundle a browser. The `cdp` module automatically detects a Chromium-based browser (Chrome, Edge, Brave) already installed on your system.

## How It Works

1. **Launch one** — `cdp.launch()` finds a browser, starts it in headless mode, and connects automatically
2. **Connect to existing** — `cdp.connect("ws://...")` attaches to a running browser or CDP server

Once connected, call `browser:attach()` to get a page, then drive it with `page:open()`, `page:wait_for_selector()`, `page:click()`, and `page:content()`.

### Under the Hood

When you call `cdp.launch()`, SpyWeb spawns the browser as a child process with `--remote-debugging-port=0` (random free port). It reads the DevTools WebSocket URL from stderr, connects, and returns a `Browser` object. Every command and response is sent as JSON-RPC messages over WebSocket — the same protocol Chrome's DevTools uses.

Each page gets its own dedicated WebSocket connection — `browser:attach()` opens a new WebSocket to the page's specific endpoint. By default, closing the browser kills the process and cleans the profile. `keep_alive = true` overrides this, keeping the browser warm across hook calls.

### All Hooks Are Optional

CDP is available globally via the `cdp` table. While it works in any hook, it is most commonly used in `override_fetch` to replace the default HTTP client.

## Hook Integration

CDP is most commonly used in `override_fetch`:

```lua
function override_fetch(request, ctx)
    local browser = cdp.launch({})
    defer(function() browser:close() end)

    local page = browser:attach()
    local ok, err = page:open(request.url)
    if not ok then
        return { error = "Navigation failed: " .. tostring(err) }
    end

    local found, wait_err = page:wait_for_selector(".dynamic-content", 10000)
    if not found then
        return { error = "Selector timeout: " .. tostring(wait_err) }
    end

    return { status = 200, body = page:content() }
end
```

## Persistent Browser Pattern

```lua
if not browser then
    browser = cdp.launch({
        headless = true,
        keep_alive = true
    })
end

function override_fetch(request, ctx)
    local page = browser:attach()
    local ok, err = page:open(request.url)
    if not ok then
        page:close()
        return { error = "Failed to load " .. request.url }
    end
    if page:wait_for_selector(".item", 5000) then
        local html = page:content()
        page:close()
        return { status = 200, body = html, url = request.url }
    else
        page:close()
        return { error = "Content timeout" }
    end
end
```

## Async vs Sync

- **Async** — frees the thread to run other tasks while waiting for I/O or network response. Your hook appears to block but the runtime stays responsive.
- **Sync** — holds the thread until the binding finishes; only used for instant operations like computation or simple reads.

The difference is purely technical and usually only matters inside `defer`. Async bindings yield the Lua VM and won't block the thread; sync bindings run to completion without yielding.

## Core API

### `cdp.launch(options)`
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `executable` | string | auto-detected | Path to browser binary |
| `headless` | boolean | `true` | Run headless |
| `user_data_dir` | string | `~/.spyweb/<job-folder-name>` | Browser profile |
| `args` | table | — | Extra flags e.g. `{"--proxy-server=..."}` |
| `keep_alive` | boolean | `false` | Keep browser alive after Lua GC |

### `cdp.connect(ws_url, [headers])`
Connects to an existing browser via DevTools WebSocket URL.

### `cdp.get_browser()`
Returns the path to the auto-detected browser executable.

### `cdp.sleep(ms)`
Async sleep for use within hooks.

## Browser API

- `browser:attach([opts])` — Returns a Page object. `opts` can include `url` (initial URL, default `about:blank`), `reuse` (reuse blank tab, default `true`), `browserContextId` (attach to specific context).
- `browser:new_context()` — Creates an isolated session. Returns a Context object.
- `browser:close()` — Closes browser and kills the process
- `browser:get_user_data_dir()` — Returns the profile path
- `browser:call(method, params)` — Raw browser-level CDP command
- `browser:wait_event(event, [timeout_ms], [predicate])` — Wait for browser-level CDP notification
- `browser:attach_session(target_id)` — Attach to an existing target by ID, returns a session ID
- `browser:call_session(session_id, method, params)` — Call CDP method on a specific session
- `browser:wait_session_event(session_id, event, [opts])` — Wait for session-level events

## Context API

- `context.id` — Unique string ID
- `context:attach([url])` — Creates a new page in the context
- `context:close()` — Closes context and all pages

## Page API

### Native Methods (Core)
- `page:call(method, params)` — Raw page-level CDP command
- `page:call_save(method, params, path)` — Optimized binary CDP call. Saves the `data` field of the response to `path` and returns the JSON without the massive data string. Supports `.png`, `.jpg`, `.pdf`, `.zip`, etc.
- `page:wait_event(event, ...)` — Wait for a page-level CDP notification. Accepts variadic args: timeout (number), predicate (function), or a table with `timeout_ms`/`timeout` and `predicate`.
- `page:close()` — Closes the specific tab

### Navigation
- `page:open(url, [wait_until], [timeout_ms])` — Returns `true` or `nil, error`
- `page:wait_for_selector(selector, [opts])` — Returns `true, element_info` or `nil, error`
- `page:wait_for_idle([timeout_ms], [quiet_ms])` — Wait for network idle
- `page:wait_for_url(pattern, timeout_ms)` — Polls URL until match

### Evaluation
- `page:evaluate(js)` — Returns result of JavaScript expression
- `page:content()` — Returns full rendered HTML
- `page:screenshot(path, [opts])` — Saves screenshot (10MB limit). Supports `{format = "png"|"jpeg", quality = 1..100, full_page = true, fullPage = true, fromSurface = true}`

### Interaction
- `page:click(selector, [opts])` — `opts.real = true` for hardware mouse events
- `page:type(selector, text, [opts])` — `opts.real = true` for hardware keyboard events
- `page:scroll([opts])` — Scroll page with configurable options: `max_scrolls` (default 20), `step`, `delay_ms` (default 250), `until_selector`, `until_bottom` (default `true`)
- `page:set_extra_headers(headers)` — Set extra HTTP headers
- `page:set_user_agent(ua, [opts])` — Override User-Agent. `opts` can include `accept_language` and `platform`.

### Network
- `page:block_resources(types)` — Block resources e.g. `{"image", "font", "media"}`
- `page:wait_for_response([predicate], [timeout_ms])` — Wait for network response
- `page:cookies([urls])` — Get all cookies, or filtered by URL
- `page:set_cookies(cookies)` — Set cookies

## Specialized Browsers

### Lightpanda
Lightweight browser in Zig. Runs as a persistent server — use `cdp.connect()` not `cdp.launch()`:

```bash
lightpanda serve --port 9222
```

```lua
local browser = cdp.connect("ws://127.0.0.1:9222")
```

### Obscura
Headless browser for advanced anti-detection. Note the `/devtools/browser` path suffix:

```bash
obscura serve --port 9222 --stealth
```

```lua
local browser = cdp.connect("ws://127.0.0.1:9222/devtools/browser")
```

### Compatibility

These browsers implement CDP but may not support every method:

| Helper | Lightpanda | Obscura |
|--------|-----------|---------|
| `page:screenshot()` | Returns a fake placeholder image | Not supported |
| `page:block_resources()` | Not supported | Not supported |
| `page:cookies()` (no args) | Works | Use `page:cookies({url})` instead |
| `page:type(text, {real=true})` | Works | Not supported |

Test your hooks thoroughly and fall back to a standard browser if something doesn't work.

## Hybrid Human-in-the-Loop

For aggressive bot detection (Cloudflare, CAPTCHAs), implement a "Hybrid Recovery" flow:

1. **Normal mode** — scrape headlessly for speed
2. **Detection** — check for a block selector (e.g. `#captcha-container`) in `override_fetch`
3. **Transition** — close the headless browser and launch a visible Chrome instance. If session persistence (cookies/login) matters, use Chromium-based browsers for both steps and share the same `user_data_dir`. Lightpanda and Chrome cannot share profiles.
4. **Notification** — use `notify()` to alert a human operator
5. **Intervention** — `while` loop polling for a "success" selector that appears after the human solves the puzzle
6. **Handback** — capture HTML, close the visual browser, return to headless mode

See `examples/hybrid-recovery/hooks.lua` for a production-ready implementation.
