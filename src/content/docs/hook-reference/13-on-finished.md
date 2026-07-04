---
title: on_finished
description: Batch-level lifecycle hook that fires after all workers complete a job iteration.
---

`on_finished()` is a batch-level lifecycle hook that fires after all workers complete a job iteration, before the interval sleep. No `ctx` parameter, operates on shared globals accumulated during the batch.

## Signature

```lua
function on_finished() -> void
```

## Parameters

None.

## Returns

None.

## Example

```lua
function on_finished()
    log("All workers done, sleeping until next interval")
    _G.batch_stats = nil -- clear accumulated state
end
```

## See Also

- [Lifecycle](/hook-reference/lifecycle) - Full lifecycle documentation
- [Multi-Worker](/job-configuration/multi-worker) - Multi-worker concurrency details
