---
title: TOML Config
description: Job configuration in TOML format.
sidebar:
  order: 1
---

Jobs in SpyWeb are configured via TOML. Use a single `jobs.toml` in the root directory or a modular `jobs/my-job/config.toml` structure.

SpyWeb validates config statically before startup or reload.

## Job Config

### Core

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | - | Job name |
| `url` | string | Yes | - | Target URL |
| `selector` | string | Yes | - | CSS selector for item containers |
| `fields` | array | Yes | - | Fields to extract |
| `urls` | string[] | No | - | Multiple entry URLs (overrides `url`) |

### Behavior

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `enabled` | bool | No | `true` | Enable/disable job |
| `interval` | integer | No | `600` | Run interval (seconds) |
| `workers` | integer | No | `1` | Per-job worker concurrency |

### Filtering & Dedup

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `keywords` | string[] | No | - | Filter by keywords |
| `search_fields` | string[] | No | - | Limit keyword search to specific fields |
| `hash_fields` | string[] | No | all | Fields for dedup hash |

### Network & Output

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `headers` | table | No | - | Custom HTTP headers |
| `proxy` | table | No | - | Proxy configuration |
| `webhook` | table | No | - | Webhook configuration |
| `notification` | table | No | `enabled` | Desktop notification settings |
| `debug` | bool | No | `false` | Save raw HTML + extracted JSON |

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
# Shorthand - "name:selector" (defaults to text content)
fields = ["title:h2", "link:a@href"]

# Full form - explicit selector and attribute
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

To reshape the webhook payload (e.g. for Discord embeds or Slack blocks), use `before_webhook` in your hooks. See [Webhook Payloads](/api-and-server#2-webhook-payloads) for details.

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
