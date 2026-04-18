# API — Architecture

## Responsibility
- Expose data produced by News scorer and Global Event Tracker
- Handle authentication and request validation
- Act as the single backend ingress for the Frontend

## Tech Stack

| Component | Technology |
|---|---|
| Framework | FastAPI (Python 3.12, async) |
| Validation | Pydantic v2 |
| Auth | Token-based (`Authorization: Bearer`) |
| ORM | SQLAlchemy 2.0 (async) |

## Routers

- `articles.py` — article list, filters, detail
- `graph.py` — events, edges, graph traversal
- `sources.py` — crawl source CRUD (admin)
- `health.py` — `/health` liveness check

## Key Design

- Next.js proxies all browser requests to FastAPI via `/api/[...proxy]` — FastAPI URL is never exposed to the browser
- Auth token injected server-side in Next.js proxy; no API keys in browser
