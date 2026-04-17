# Good News Collector Frontend — Architecture

## Responsibility
- Display scored articles from the News Scorer service
- Provide filtering and sorting for investment research

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Data fetching | SWR |
| Backend proxy | Next.js `/api/[...proxy]` → FastAPI |

## Pages

- `/` — article list with sortable columns, importance badges, and source URL links

## Key Design

- Stateless UI — no client-side graph state; all data fetched from API
- All API calls go through Next.js proxy; FastAPI URL never exposed to browser
