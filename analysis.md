# sw-docs Accuracy Audit

Cross-reference of `sw-docs/src/content/docs/` against the actual codebase.

## MAJOR (behavior wrong, will mislead users)

| # | File | Issue |
|---|------|-------|
| 1 | `api-and-server.mdx` | ~~**Webhook payload format entirely wrong.** Doc shows `{ items: [{ fields: {...}, matches: [...] }] }`. Actual code flattens fields into the item object and uses `_keywords` (comma-joined string) instead of `matches` array. See `src/services/webhook.rs:37-61`.~~ **FIXED** — Payload now uses flat items with `keywords` array, removed 50-item cap. |
| 2 | `cli-and-operations/deployment.md:91` | ~~**Non-existent API route.** Doc uses `curl /api/v1/status`. No `/api/v1/` prefix exists anywhere — it's `/api/v/{name}`. Request would return 404.~~ **FIXED** — Changed to `/api/jobs`. |

## MEDIUM (incorrect contract, will cause debugging sessions)

| # | File | Issue |
|---|------|-------|
| 3 | `lua-globals/json_decode.mdx` | ~~**Says returns `nil` on malformed JSON.** Implementation throws a Lua error (`serde_json::from_str(s)?`). Users must use `pcall` to catch it.~~ **FIXED** — Now returns `(nil, error)` on failure, matching HTTP two-return pattern. |
| 4 | `lua-globals/storage.md` | ~~**`global_store_incr` two-value return is wrong.** Doc shows `local new_count, err = ...` with nil-check pattern. Implementation returns a single number always (defaults on error, logs internally).~~ **FIXED** — Example now uses single-return pattern, notes internal error logging. |
| 5 | `lua-globals/http_*.mdx` | **INACCURATE** — "binary-safe" is only wrong on the *response* body (http_get). Request body (http_post/http_request/http_multipart) correctly sends binary data. http_get.mdx fixed. |
| 6 | `examples/custom-filtering.mdx:68` | **INACCURATE** — `filter_item` correctly replaces keyword filtering; `matching_keywords()` only tags kept items, does not filter. |

## LOW (minor inaccuracies, omissions)

| # | File | Issue |
|---|------|-------|
| 7 | `hook-reference/04-override-extract.md` | ~~`nil`/`false` return undocumented. Signature says `-> table`, but code treats nil/false as empty items (`Ok(vec![])`).~~ **FIXED** — Added nil/false to signature and Returns table. |
| 8 | `hook-reference/02-override-fetch.md` | ~~No warning that `nil`/`false` causes a pipeline error ("must return a response table") — unlike every other hook where nil means skip.~~ **FIXED** — Added warning and nil/false to Returns table. |
| 9 | `hook-reference/05-after-extract.md` through `09-before-webhook.md` | ~~Each omits `false` as a valid skip return value. Code treats `false` identically to `nil`, docs only mention `nil` in the Returns table.~~ **FIXED** — Added `false` alongside `nil` in Returns tables. |
| 10 | `testing.mdx:42` | ~~Says "Each test gets a new temporary Redb database." Actual backend depends on build feature flag; with `--features sqlite` it's SQLite.~~ **FIXED** — Generalized to mention build feature flags. |
| 11 | `api-and-server.mdx` | ~~HTTP response body 10MB limit documented nowhere (`MAX_RESPONSE_BODY` in `network.rs:8`). Request body is silently truncated at 10MB, not rejected (`server/mod.rs:7`).~~ **FIXED** — Added truncation note to `self.body` Request Context table. Response body limit already documented in http_get/http_post/http_multipart :::note boxes. |
| 12 | `job-configuration/toml-config.md:29` | ~~`notification` default timeout documented as "auto". Actual default is `0` (`defaults.rs:16`).~~ **FIXED** — Changed to `0`. |
| 13 | `cli-and-operations/index.md` | ~~`spyweb v` alias not documented. `spyweb check` exits 0 on config error (error discarded) vs `spyweb check config` exits 1 — behavioral difference undocumented.~~ **FIXED** — Added `v` alias and exit code caution. |
| 14 | `api-and-server.mdx:273`, `file-structure.mdx:102` | Server has two log files: `server.log` (via `log()` binding) and `error.log` (runtime errors). Only `error.log` is documented. — **SKIPPED** (trivial, not worth updating). |
| 15 | `lua-globals/require.mdx` | ~~`require` is gated behind `#[cfg(feature = "luau")]`. Docs don't mention it's unavailable in non-luau builds.~~ **FIXED** — Added caution note about Luau-only availability. |
| 16 | `api-and-server.mdx` | Webhook items silently limited to 50 (`.take(50)` in webhook.rs). Undocumented. — **DUPLICATE OF #1** (cap removed in that fix). |
| 17 | `lua-globals/json_decode.mdx` | 10MB limit is `10_000_000` bytes (~9.54 MiB), not `10 * 1024 * 1024` (10 MiB) used by HTTP limits. Minor inconsistency. — **SKIPPED** (code-level nit, docs say "10MB" for both). |
| 18 | `hook-reference/context.md` | ~~`ctx.selector_matches` described as "CSS selector hits" — only accurate for built-in extractor. With `override_extract`, it equals items count returned by the hook.~~ **FIXED** — Generalized to "items found during extraction". |
| 19 | `hook-reference/lifecycle.md` | `on_success`/`on_error`/`on_finally` documented as "Defined in `defer.lua`". Technically they only require `defer.lua` to exist on disk; function can be in `hooks.lua` since both share the same VM. — **SKIPPED** (convention provides clarity, both statements are accurate). |
