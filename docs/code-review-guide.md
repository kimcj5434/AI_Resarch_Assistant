# Good News Board — Code Review Guide

> Generated after implementation of the FastAPI backend + frontend update.
> Intended for reviewing all modules with context on structure, behavior, and design rationale.

---

## System Overview

```
Browser
  └── Next.js (port 3000)
        └── /api/[...proxy]  ←── proxies all API calls (browser never talks to FastAPI directly)
              └── FastAPI (port 8000)
                    ├── PostgreSQL (port 5432)  ←── stores all articles
                    └── Claude API (external)   ←── scores each article -1/0/1
```

**Key design principle:** The browser only talks to Next.js.
Next.js forwards all `/api/*` requests to FastAPI on the server side.
This means no API keys or backend URLs are ever exposed to the browser.

---

## Recommended Review Order

Start from the outside in — data shape first, then routes, then services.

| # | File | Why here |
|---|------|----------|
| 1 | `docker-compose.yml` | Understand the runtime: 3 containers, how they connect |
| 2 | `api/app/models.py` | The Article table — the core data shape everything else uses |
| 3 | `api/app/schemas.py` | What the API accepts and returns (vs. what the DB stores) |
| 4 | `api/main.py` | App entry point — how FastAPI starts up |
| 5 | `api/app/routers/articles.py` | The 4 CRUD endpoints the frontend uses |
| 6 | `api/app/routers/crawl.py` | Manual crawl trigger endpoint |
| 7 | `api/services/crawler/base.py` | The shared interface all crawlers implement |
| 8 | `api/services/crawler/gdelt.py` | GDELT implementation (the only active crawler) |
| 9 | `api/services/scorer.py` | Claude API call — scores one article, returns -1/0/1 + reason |
| 10 | `api/services/crawler_pipeline.py` | Orchestrator: fetch → dedup → score → save |
| 11 | `api/services/scheduler.py` | Runs the pipeline automatically on a timer |
| 12 | `frontend/…` | Frontend changes — mostly renaming + 2 new UI features |

---

## Module 1 — `docker-compose.yml`

**What it does:**
- Defines 3 services: `db` (PostgreSQL), `api` (FastAPI), `frontend` (Next.js)
- Wires them together on a shared internal network
- `api` waits for `db` to be healthy before starting (healthcheck)

**How it works:**
- `db` uses the official `postgres:16` image; data is persisted in a named volume `postgres_data`
- `api` is built from `./api` directory; receives `DATABASE_URL` and `ANTHROPIC_API_KEY` as env vars
- `frontend` is built from `./frontend/good_news_board`; receives `FASTAPI_URL=http://api:8000`
  - Inside Docker, `api` is the hostname of the FastAPI container (Docker internal DNS)

**Why this way:**
- Single command `docker compose up` brings up the entire stack
- `ANTHROPIC_API_KEY` stays on the host; never baked into the image
- `service_healthy` dependency prevents FastAPI from crashing on startup when DB isn't ready

**To run:**
```bash
ANTHROPIC_API_KEY=sk-ant-... docker compose up
```

---

## Module 2 — `api/app/models.py`

**What it does:**
- Defines the `articles` database table as a Python class using SQLAlchemy ORM

**The Article columns:**

| Column | Type | Meaning |
|--------|------|---------|
| `id` | int | Auto-incrementing primary key |
| `headline` | string | Article title |
| `source` | string | Where it came from (e.g. "reuters.com", "GDELT") |
| `url` | string, unique | Deduplication key — no two articles share a URL |
| `published_at` | datetime | When the article was published |
| `collected_at` | datetime | When the crawler fetched it (auto-set by DB) |
| `score` | int | LLM score: `-1` irrelevant, `0` neutral, `1` investment-positive |
| `reason` | text, nullable | Korean explanation — only populated when `score == 1` |
| `is_shown` | bool | Whether this article appears in the frontend |
| `is_manual` | bool | `True` if user added it manually (bypasses LLM scoring) |

**Why all articles are stored (even score -1):**
- Design intent: if scoring criteria change later, we can re-score stored articles without re-crawling
- Only `is_shown=True` articles appear in the frontend; the rest are kept as an audit log

**Why `url` is unique:**
- Deduplication — the same article from GDELT on two consecutive crawls is skipped on the second run

---

## Module 3 — `api/app/schemas.py`

**What it does:**
- Defines Pydantic models: the shape of data coming **in** (requests) and going **out** (responses)
- Separate from `models.py` — the DB model and the API contract are intentionally different

**Three schemas:**

- **`ArticleCreate`** — used for `POST /api/articles` (manual add):
  - Required: `headline`, `source`, `url`, `published_at`, `reason`
  - Note: no `score` or `is_shown` — those are hardcoded to `1` and `True` for manual articles

- **`ArticleUpdate`** — used for `PATCH /api/articles/{id}` (edit):
  - All fields are **optional** (you only send the fields you want to change)
  - Supports `is_shown` — this is the toggle for hiding/showing articles from the board

- **`ArticleResponse`** — returned by all endpoints:
  - Full shape including `score`, `is_shown`, `is_manual`, `reason`
  - `model_config = {"from_attributes": True}` tells Pydantic to read from the SQLAlchemy ORM object

**Why separate models instead of one?**
- `ArticleCreate` blocks users from setting `score` or `is_shown` directly (those are controlled by the backend)
- `ArticleUpdate` makes all fields optional so you can send just `{"is_shown": false}` to hide an article

---

## Module 4 — `api/main.py`

**What it does:**
- The FastAPI app entry point — creates the app, registers routes, handles startup/shutdown

**How it works:**
- `lifespan` is an async context manager that runs code on startup and shutdown:
  1. `init_db()` — creates the `articles` table if it doesn't exist yet
  2. `start_scheduler()` — starts the background crawl timer
  3. On shutdown: `stop_scheduler()` — graceful cleanup
- Three routers are mounted: `health`, `articles` (under `/api`), `crawl` (under `/api`)
- CORS middleware allows all origins — fine for local/internal use

**Why `lifespan` instead of `@app.on_event("startup")`:**
- `on_event` is deprecated in newer FastAPI; `lifespan` is the current recommended pattern

---

## Module 5 — `api/app/routers/articles.py`

**What it does:**
- Implements the 4 CRUD endpoints the frontend calls

**Endpoints:**

- **`GET /api/articles`**
  - Default: returns only `is_shown=True` articles, sorted by newest first
  - Optional filters: `date_from`, `date_to`, `source`, `is_shown`, `page`, `limit`
  - Pagination: `page=1&limit=10` by default

- **`POST /api/articles`**
  - Creates a manual article
  - Checks for duplicate URL → returns `409 Conflict` if already exists
  - Hardcodes `score=1`, `is_shown=True`, `is_manual=True` (no LLM needed for manual)

- **`PATCH /api/articles/{id}`**
  - Updates only the fields sent in the request body
  - `model_dump(exclude_none=True)` skips any field that wasn't included

- **`DELETE /api/articles/{id}`**
  - Deletes the article; returns `204 No Content`

**Pattern: `Depends(get_session)`**
- FastAPI's dependency injection — each request gets its own database session
- Session is automatically closed when the request finishes

---

## Module 6 — `api/app/routers/crawl.py`

**What it does:**
- Exposes `POST /api/crawl/run` — the "crawl now" button in the frontend

**How it works:**
1. Request comes in
2. FastAPI returns `202 Accepted` immediately (doesn't wait for crawl to finish)
3. Crawl runs in the background via `BackgroundTasks`

**`_crawl_running` flag:**
- Prevents two crawls from running simultaneously
- If a crawl is already in progress and the button is clicked again, the second call is ignored

**Why 202 instead of 200?**
- A crawl takes 10–60 seconds (LLM calls for each article)
- Returning 200 would block the browser until it's done; 202 means "received, working on it"

---

## Module 7 — `api/services/crawler/base.py`

**What it does:**
- Defines the shared interface (`CrawlerBase`) that all crawler implementations must follow

**Two classes:**

- **`RawArticle`** — a simple data container (dataclass):
  - `headline`, `url`, `source`, `published_at`
  - No score, no reason — just raw data before LLM processing

- **`CrawlerBase`** — abstract base class:
  - One method: `async def fetch(self) -> list[RawArticle]`
  - Any new crawler (GDELT, RSS, custom) must implement this one method

**Why an abstract base class?**
- Enables the pipeline (`crawler_pipeline.py`) to call `crawler.fetch()` without knowing which crawler it is
- Adding a new source = write a new class that implements `fetch()`, no changes elsewhere

---

## Module 8 — `api/services/crawler/gdelt.py`

**What it does:**
- Fetches finance/economy articles from the free GDELT Project API

**How it works:**
1. Calculates a time window: from `(now - lookback_hours)` to `now`
2. Calls GDELT REST API with a finance/economy query in Korean + English
3. Parses the response: extracts `title`, `url`, `domain`, `seendate` for each article
4. Returns a list of `RawArticle` objects

**GDELT query:**
```
economy investment finance market earnings positive sourcelang:kor OR sourcelang:eng
```
- `sourcelang:kor` — Korean sources
- `sourcelang:eng` — English sources
- No API key required — GDELT is a free public API

**`seendate` parsing:**
- GDELT returns dates in format `20260425T120000Z`
- Parsed via `strptime("%Y%m%dT%H%M%SZ")` → converted to Python `datetime`

**Error handling:**
- Any network or parse error returns an empty list (does not crash the pipeline)

---

## Module 9 — `api/services/scorer.py`

**What it does:**
- Calls Claude API to score one article as `-1`, `0`, or `1`
- If score is `1`, also generates a Korean reason explaining the investment value

**How it works:**
1. Loads `scorer_criteria.md` (once, then cached in memory)
2. Calls `claude-sonnet-4-6` with the criteria as system prompt + article headline as user message
3. Expects Claude to respond with JSON: `{"score": 1, "reason": "..."}`
4. Strips any markdown code fences (` ```json `) from the response
5. Returns `ScoreResult(score, reason)`

**Prompt caching:**
- `scorer_criteria.md` is sent with `"cache_control": {"type": "ephemeral"}`
- Claude caches this as a "prefix" — if the criteria doesn't change, subsequent calls skip re-processing it
- Reduces latency and API cost when scoring many articles in one pipeline run

**Retry logic:**
- `RateLimitError` or `APITimeoutError` → exponential backoff: wait 1s, then 2s, then give up
- Any other error → log warning, return `score=0` (neutral, not shown)
- If `ANTHROPIC_API_KEY` is empty → skip LLM, return `score=0` (safe fallback for local dev)

---

## Module 10 — `api/services/crawler_pipeline.py`

**What it does:**
- Orchestrates the full end-to-end crawl: fetch → dedup → score → save

**Steps:**
1. **Load sources** — reads `api/config/crawler_sources.yaml`, filters `enabled: true` sources
2. **Fetch** — calls each enabled crawler's `fetch()` method; collects all `RawArticle` objects
3. **Dedup** — queries DB for any URLs already stored; filters out duplicates
4. **Score + Save** — for each new article:
   - Calls `score_article(headline, url)` → `ScoreResult`
   - Creates `Article` ORM object with `score`, `reason`, `is_shown = (score == 1)`
   - Adds to session
5. **Commit** — writes all new articles to PostgreSQL in one transaction

**Why dedup before scoring?**
- LLM calls cost money and take time
- No point scoring an article already in the DB

**Why commit once at the end?**
- More efficient than committing after each article
- If something fails mid-way, no partial writes

---

## Module 11 — `api/services/scheduler.py`

**What it does:**
- Runs the crawl pipeline automatically on a configurable interval

**How it works:**
- Uses `APScheduler` (AsyncIOScheduler — integrates with Python's async event loop)
- On startup, reads `crawl_interval_hours` from `crawler_sources.yaml` (default: 24)
- Registers `run_pipeline` as a job: `interval=24h`
- `misfire_grace_time=600` — if the server was down when a job was due, run it up to 10 min late

**Started/stopped in `main.py` lifespan:**
- `start_scheduler()` on app startup
- `stop_scheduler()` on app shutdown (graceful)

**Config file location:** `api/config/crawler_sources.yaml`
```yaml
crawler:
  crawl_interval_hours: 24   # change this to adjust crawl frequency
```

---

## Module 12 — Frontend Changes

### `types/index.ts`

**Changes:**
- `published_date: string` → `published_at: string` (matches backend DB field name)
- Added `score: number`, `is_shown: boolean`, `is_manual: boolean`
- `reason` changed from `string` to `string | null` (auto-crawled articles may have no reason)
- `ArticleFormData` gets optional `is_shown?: boolean` (used in edit mode only)

---

### `lib/api.ts`

**Changes:**
- Updated all field references from `published_date` to `published_at`
- Added `triggerCrawl()` function — calls `POST /api/crawl/run`

---

### `components/ArticleCard.tsx`

**Changes:**
- `article.published_date` → `article.published_at`
- `reason` is now conditionally rendered (null-safe: `{article.reason && <p>…</p>}`)
- Added "숨김" badge when `is_shown === false`
- Added "수동" badge when `is_manual === true`

---

### `components/ArticleFormModal.tsx`

**Changes:**
- `published_date` → `published_at` in form state and input field
- `reason` pre-fill handles `null`: `article.reason ?? ""`
- `required={!isEditMode}` on reason field — required when creating, optional when editing
  (auto-crawled articles may have no reason if score ≠ 1)
- Added `is_shown` checkbox in edit mode — "보드에 표시" toggle

---

### `components/ArticleList.tsx`

**Changes:**
- All `published_date` references renamed to `published_at`
- Added `crawling` state and `handleCrawl` function:
  1. Calls `triggerCrawl()` → API returns 202 immediately
  2. Waits 5 seconds (time for backend to process)
  3. Calls `fetchArticles()` and updates the list
- Added "지금 크롤링" button with spinning icon while crawling

---

### `app/api/[...proxy]/route.ts` (Next.js proxy)

**What it does:**
- First tries to forward the request to FastAPI
- If FastAPI is unreachable (e.g. local dev without Docker), falls back to `mock_db.json`

**Changes:**
- `MockArticle` type added — explicitly typed with all new fields
- `GET /articles` now filters by `is_shown` (default: true) to match FastAPI behavior
- `POST /articles` mock now populates `score=1`, `is_shown=true`, `is_manual=true` defaults
- Added `POST /crawl/run` mock — returns `202` immediately (no actual crawl in mock mode)
- Variable renamed from `path` to `urlPath` (avoids shadowing Node's `path` module import)

---

## `api/scorer_criteria.md`

**What it does:**
- The LLM system prompt that defines what score -1, 0, 1 means
- Read once at startup and cached in memory by `scorer.py`
- Also cached on the Claude API side via prompt caching

**To change scoring behavior:**
- Edit this file and restart the API
- Optionally re-score existing articles via `TODO-001` in `TODOS.md`

---

## `api/config/crawler_sources.yaml`

**What it controls:**
- `crawl_interval_hours` — how often the scheduler runs automatically
- `sources` list — which crawlers are active
  - `enabled: true/false` — toggle without deleting
  - `robots_txt_checked: true` — must be confirmed before enabling any source
  - `max_records` — how many articles to fetch per GDELT call
  - `lookback_hours` — how far back in time to query GDELT

**To add a new RSS source:**
1. Add entry to `sources` with `type: "rss"`, `url`, `name`
2. Verify `robots.txt` and terms of service
3. Set `robots_txt_checked: true` and `enabled: true`
4. Restart the API

---

## Data Flow Summary

```
POST /api/crawl/run
  │
  ▼
crawler_pipeline.py
  ├─ gdelt.py         fetch(50 articles, last 24h)
  ├─ dedup            filter URLs already in DB
  └─ for each new article:
       scorer.py      claude-sonnet-4-6 → {"score": 1, "reason": "..."}
       models.py      Article(score=1, is_shown=True, reason="...")
       DB commit
  │
  ▼
GET /api/articles?is_shown=true
  │
  ▼
Next.js proxy → ArticleList → ArticleCard
```
