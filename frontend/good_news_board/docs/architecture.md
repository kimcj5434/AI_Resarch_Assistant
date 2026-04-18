# Good News Board Frontend — Architecture

## Responsibility
- Display scored articles from the News Scorer service
- Provide filtering, sorting, and search for investment research
- Allow manual article management (create, edit, delete)

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend proxy | Next.js `/api/[...proxy]` → FastAPI |

## Pages & Components

- `/` — article card list with search, date filter, and sort controls
- `ArticleCard` — displays headline, source, collected time, published date, reason; card menu for edit/delete
- `ArticleFormModal` — shared modal for create and edit
- `DeleteConfirmDialog` — confirmation dialog before deletion

## Directory Structure

```
frontend/good_news_board/
├── app/
│   ├── layout.tsx
│   ├── page.tsx               # SSR — article list
│   └── api/
│       └── [...proxy]/
│           └── route.ts       # Next.js → FastAPI proxy
├── components/
│   ├── ArticleCard.tsx
│   ├── ArticleFormModal.tsx
│   └── DeleteConfirmDialog.tsx
└── lib/
    └── api.ts                 # fetch helpers
```

## Rendering Strategy

| Page / Component | Strategy | Reason |
|---|---|---|
| Article list (`/`) | SSR | Initial load with full data |
| Search / date filter | CSR | Real-time filtering without full page reload |
| ArticleFormModal | CSR | User interaction only |

## Data Flow

```
Browser
  └── Server Component (SSR)  →  /api/[...proxy]  →  FastAPI
  └── Client Component (CSR)  →  /api/[...proxy]  →  FastAPI
```

## API Interactions

| Action | Method | Endpoint |
|---|---|---|
| Fetch articles | GET | `/api/articles` |
| Create article | POST | `/api/articles` |
| Update article | PATCH | `/api/articles/{id}` |
| Delete article | DELETE | `/api/articles/{id}` |

## Key Design

- All API calls go through Next.js proxy; FastAPI URL never exposed to browser
- No client-side state library — Server Components fetch data directly, Client Components use local state
