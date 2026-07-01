---
title: Configuration
description: Job configuration in TOML format.
sidebar:
  order: 1
---

Jobs in SpyWeb are configured via TOML. Use a single `jobs.toml` in the root directory or a modular `jobs/my-job/config.toml` structure.

SpyWeb validates config statically before startup or reload.

## Job Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | *required* | Job name |
| `url` | string | *required* | Target URL |
| `selector` | string | *required* | CSS selector for item containers |
| `fields` | array | *required* | Fields to extract |
| `enabled` | bool | `true` | Enable/disable job |
| `interval` | integer | `600` | Run interval (seconds) |
| `keywords` | string[] | *none* | Filter by keywords |
| `search_fields` | string[] | *none* | Limit keyword search to specific fields |
| `debug` | bool | `false` | Save raw HTML + extracted JSON |
| `workers` | integer | `1` | Per-job worker concurrency |
| `urls` | string[] | *none* | Multiple entry URLs |
| `headers` | table | *none* | Custom HTTP headers |
| `hash_fields` | string[] | *all* | Fields for dedup hash |
| `proxy` | table | *none* | Proxy configuration |
| `webhook` | table | *none* | Webhook configuration |
| `notification` | table | *auto* | Desktop notification settings |

## Validation Rules

- `name`, `url`, `selector`, and `fields` are required and cannot be blank
- `fields` must contain at least one entry
- `interval` must be > 0
- `workers` must be > 0 if set
- All URLs must be absolute (including `webhook.url` and `proxy.urls`)
- `urls` must contain at least one valid URL if set
- Field names must be unique within a job
- `search_fields` and `hash_fields` must reference existing extracted field names
- Job names and normalized IDs must be unique across all jobs

## Field Syntax

```toml
# Shorthand — "name:selector" (defaults to text content)
fields = ["title:h2", "link:a@href"]

# Full form — explicit selector and attribute
fields = [
  { name = "title", selector = "h2", att = "text" },
  { name = "link", selector = "a", att = "href" },
]
```

## Proxy Config

```toml
[proxy]
enabled = true
rotate = "RoundRobin"  # or "Sticky", "Random"
urls = [
  "socks5://proxy1:1080",
  "http://proxy2:8080",
]
```

## Deduplication (`hash_fields`)

By default SpyWeb hashes **all extracted fields** to determine if an item is new. This catches every update (price changes, modified descriptions).

For volatile data that changes independently (e.g. `date_posted`, `view_count`), use `hash_fields` to specify only the fields that uniquely identify the item:

```toml
hash_fields = ["link"]
```

If all specified `hash_fields` are empty for an item, SpyWeb falls back to hashing all fields.

## Webhook Config

```toml
[webhook]
enabled = true
url = "https://your-webhook.example.com/endpoint"
headers = { "Authorization" = "Bearer your-token" }
```

## Notification Templates

```toml
[notification]
enabled = true
timeout = 5000
title = "Found {item_count} new items from {job_name}"
body = """
Title: {title}
Link: {link}
Keywords: {matches}
"""
```

Available tags: `{job_name}`, `{url}`, `{item_count}`, `{timestamp}`, `{matches}`, `{match_count}`, and any extracted field name.

Most desktop OS restrict notification bodies to about 4 lines. Templates with multiple fields per item will show roughly one record per pop-up.
