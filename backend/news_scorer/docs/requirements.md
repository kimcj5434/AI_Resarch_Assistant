# News Scorer — Requirements

## Functional

- CR-01: Crawl Korean financial portals (Naver Finance, Korea Economic Daily, Maeil Business) and global sources (Reuters, Bloomberg, Yahoo Finance) via RSS and web
- CR-02: Store per article: `source_url`, `headline`, `published_at`, `crawled_at`, `language` — do NOT store full article body
- CR-05: Detect and skip duplicate articles (same URL, or >90% headline similarity within 24h window)
- CR-06: Support configurable crawl schedules per source; schedules managed via DB without service restarts
- CR-08: Retry failed crawl attempts up to 3 times with exponential backoff; mark as `failed` after exhausting retries
- CR-10: Provide pgAdmin 4 for operators to view, filter, and manually edit article records

## Non-Functional

- NF-04: All configuration managed via environment variables
- NF-05: Independently deployable as a containerized service
- NF-08: Emit structured JSON logs
