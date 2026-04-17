# Global Event Tracker Frontend — Architecture

## Responsibility
- Visualize the event knowledge graph produced by the Global Event Tracker service
- Provide admin mode for inline graph editing

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Graph canvas | `@xyflow/react` (react-flow) |
| Graph layout | `dagre` (automatic DAG layout) |
| Data fetching | SWR |
| Backend proxy | Next.js `/api/[...proxy]` → FastAPI |

## Pages

- `/` — interactive event graph canvas with causal/temporal edges, filters, and node detail panel

## Key Design

- react-flow nodes are React components → admin edit forms render naturally inside nodes
- dagre handles automatic DAG layout; no manual positioning required
- All API calls go through Next.js proxy; FastAPI URL never exposed to browser
