# Crawler Engine — Architecture

## Responsibility
- Fetch article content from URLs (HTTP + JS-rendered pages)
- Parse RSS/Atom feeds
- Extract article text from arbitrary HTML

## Tech Stack

| Component | Technology |
|---|---|
| Article extraction | `newspaper4k` |
| Feed parsing | `feedparser` |
| HTTP client | `httpx` |
| JS-rendered fallback | `playwright` |

## Class Structure

- `BaseCrawler` — common interface: `fetch(url) -> RawArticle`
- `RSSCrawler(BaseCrawler)` — feedparser-based feed reader
- `WebCrawler(BaseCrawler)` — httpx + newspaper4k extraction
- `PlaywrightCrawler(BaseCrawler)` — headless browser fallback for JS-heavy pages
