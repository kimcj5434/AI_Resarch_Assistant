# Good News Board Frontend — Architecture

## Responsibility
- Display scored articles from the News Scorer service
- Provide filtering, sorting, and search for investment research
- Allow manual article management (create, edit, delete)

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v3 + shadcn/ui (Radix UI primitives) |
| Icons | lucide-react |
| Date handling | date-fns v4 |
| Backend proxy | Next.js `/api/[...proxy]` → FastAPI |

## Pages & Components

- `/` — SSR article list page with search, date filter, sort controls, and pagination
- `ArticleList` — CSR wrapper managing filter/sort/pagination state and CRUD operations
- `ArticleCard` — displays headline (link), source badge, reason, collected time, published date; card menu for edit/delete
- `ArticleFormModal` — shared modal for create and edit
- `DeleteConfirmDialog` — confirmation dialog before deletion
- `components/ui/` — shadcn/ui base components (Button, Badge, Dialog, DropdownMenu, Input, Label, Textarea)

## Directory Structure

```
frontend/good_news_board/
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .eslintrc.json
├── next-env.d.ts
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx               # SSR — article list
│   └── api/
│       └── [...proxy]/
│           └── route.ts       # Next.js → FastAPI proxy
├── components/
│   ├── ArticleCard.tsx
│   ├── ArticleFormModal.tsx
│   ├── ArticleList.tsx
│   ├── DeleteConfirmDialog.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── textarea.tsx
├── lib/
│   ├── api.ts                 # fetch helpers (CRUD)
│   └── utils.ts               # cn(), getSourceColor()
├── types/
│   └── index.ts               # Article, ArticleFormData, SortOrder
└── docs/
    ├── architecture.md
    ├── requirements.md
    └── history/
```

## Rendering Strategy

| Page / Component | Strategy | Reason |
|---|---|---|
| Article list (`/`) | SSR | Initial load with full data |
| `ArticleList` | CSR | Real-time filtering, sorting, pagination without full reload |
| `ArticleFormModal` | CSR | User interaction only |
| `DeleteConfirmDialog` | CSR | User interaction only |

## Data Flow

```
Browser
  └── Server Component (SSR, page.tsx)  →  /api/[...proxy]  →  FastAPI
  └── Client Component (ArticleList)    →  /api/[...proxy]  →  FastAPI
```

## API Interactions

| Action | Method | Endpoint |
|---|---|---|
| Fetch articles | GET | `/api/articles` |
| Create article | POST | `/api/articles` |
| Update article | PATCH | `/api/articles/{id}` |
| Delete article | DELETE | `/api/articles/{id}` |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `FASTAPI_URL` | `http://localhost:8000` | FastAPI base URL for proxy |

## Key Design

- All API calls go through Next.js proxy; FastAPI URL never exposed to browser
- No client-side state library — Server Components fetch data directly, Client Components use local `useState`
- Source badge color is deterministically assigned by hashing the source name (8 color palette)
- Pagination: 10 articles per page, client-side
