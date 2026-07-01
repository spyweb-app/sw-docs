---
title: defer
description: Registers a cleanup function to run immediately after the top-level hook exits.
---

`defer(fn)` registers a cleanup function to run immediately after the top-level hook exits. Essential for preventing zombie processes and memory leaks.

:::note
**Hook-scoped:** Cleanup runs when the main stage (e.g., `before_fetch`) finishes, even if `defer` was called inside a helper function.
:::

:::note
**Synchronous only:** You cannot use async functions (like `http_post` or `cdp.launch`) inside `defer`. Resource close methods (such as `browser:close()` or `page:close()`) are synchronous and fully safe to use. For async orchestration and post-cycle tasks, use `defer.lua`.
:::

:::note
Queue limit: maximum 10,000 deferred functions per hook.
:::

## Signature

```lua
defer(fn)
```

<span style="background:#6b7280;color:white;font-size:0.7em;padding:0.15em 0.5em;border-radius:4px">sync</span>

## Parameters

| Param | Type | Description |
|-------|------|-------------|
| `fn` | function | Cleanup function to call after the hook exits |

## Returns

None.

## Example

```lua
function override_fetch(request, ctx)
    local browser = cdp.launch({ headless = true })
    defer(function() browser:close() end) -- Always closes

    local page = browser:attach()
    page:open(request.url)
    return { status = 200, body = page:content() }
end
```

## See Also

- [Execution Lifecycle](/advanced-features/execution-lifecycle) — Full lifecycle documentation
