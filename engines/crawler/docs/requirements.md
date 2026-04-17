# Crawler Engine — Requirements

## Functional

- CR-01: Support RSS/Atom feed parsing and direct web crawling
- CR-08: Retry failed fetch attempts up to 3 times with exponential backoff
- CR-09: Respect `robots.txt` and configurable per-domain minimum request intervals (default: 5s)

## Non-Functional

- Return a normalized `RawArticle` object regardless of crawl method (RSS / web / playwright)
- Playwright is fallback only — use httpx by default to minimize resource usage
