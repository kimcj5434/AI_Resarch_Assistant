# Architecture

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **News Crawling** | `newspaper4k` + `feedparser` + `httpx` + `playwright` (fallback) | newspaper4k extracts articles from arbitrary HTML with Korean support; feedparser handles RSS/Atom feeds (more stable and respectful); playwright handles JS-rendered sites as a fallback |
| **LLM** | Claude API (`claude-sonnet-4-5` / `claude-haiku-4-5`) via `anthropic` SDK | Single combined prompt per article handles importance scoring + fact extraction + entity tagging; `cache_control` on system prompts reduces input token cost by ~90% |
| **Database** | PostgreSQL 16 + `pgvector` extension | Single DB for both article storage and graph data (events, edges); pgvector stores sentence embeddings for pre-clustering similarity search, avoiding a separate vector store |
| **ORM / Migrations** | SQLAlchemy 2.0 (async) + Alembic | Standard async Python ORM; Alembic for schema versioning |
| **DB GUI** | pgAdmin 4 (containerized) | Off-the-shelf tool requiring zero custom code; covers all DB inspection and editing needs |
| **Backend API** | FastAPI (Python 3.12) | Async request handling, auto OpenAPI docs, Pydantic v2 validation; same language as crawler avoids polyglot overhead |
| **Embeddings / Pre-clustering** | `sentence-transformers` (`paraphrase-multilingual-MiniLM-L12-v2`) | Multilingual (Korean + English); cosine similarity pre-filter reduces Claude clustering API calls by ~95% before authoritative LLM judgment |
| **Task Queue / Scheduler** | Celery + Redis + Celery Beat | Async crawler worker pool; Beat reads crawl schedules from DB so sources can be added/disabled without service restarts |
| **Graph Visualization** | `react-flow` (`@xyflow/react`) + `dagre` layout | React-native library; nodes as React components make admin inline editing natural; dagre for automatic DAG layout |
| **Frontend Framework** | Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui | Required by project; App Router for RSC; Tailwind + shadcn for rapid UI development |
| **Containerization** | Docker Compose | Orchestrates all services: postgres, redis, pgadmin, api, worker, beat, frontend |

---

## Directory Structure

```
AI_Resarch_Assistant/
├── docker-compose.yml
├── .env.example                  # All required environment variables documented
├── docs/
│   ├── architecture.md
│   └── plans/
├── services/
│   ├── crawler/                  # Celery workers: crawl + LLM scoring
│   │   ├── crawler/
│   │   │   ├── sources/          # BaseCrawler, RSSCrawler, WebCrawler, PlaywrightCrawler
│   │   │   ├── tasks/            # crawl.py, score.py (Celery tasks)
│   │   │   ├── llm/              # Anthropic client, prompts (cached), response schemas
│   │   │   └── db/               # SQLAlchemy models, session, repositories
│   │   └── alembic/              # DB migrations (authoritative source)
│   ├── graph/                    # Celery workers: event clustering + causal edge inference
│   │   └── graph/
│   │       ├── tasks/            # cluster.py, edges.py
│   │       ├── embeddings/       # sentence-transformers encoder + cosine similarity filter
│   │       ├── llm/              # Claude client for clustering and edge inference prompts
│   │       └── db/               # Event, EventEdge, EventArticle ORM models
│   ├── api/                      # FastAPI service
│   │   └── api/
│   │       ├── routers/          # articles.py, graph.py, sources.py, health.py
│   │       ├── schemas/          # Pydantic request/response models
│   │       ├── auth.py           # Token auth dependency
│   │       └── db/               # Repositories for articles, events, edges
│   └── frontend/                 # Next.js app
│       └── src/
│           ├── app/              # App Router pages: /graph, /articles
│           ├── components/
│           │   ├── graph/        # GraphCanvas, EventNode, CausalEdge, TemporalEdge,
│           │   │                 # NodeDetailPanel, GraphToolbar, AdminForms
│           │   └── articles/     # ArticleTable, ArticleFilters
│           ├── lib/              # api.ts, graph-layout.ts (dagre), types.ts
│           └── hooks/            # useGraph.ts, useArticles.ts (SWR)
└── scripts/                      # seed_sources.py, reset_db.py, run_graph_rebuild.py
```

---

## Key Decisions

### 1. PostgreSQL for graph storage (not Neo4j)
Investment news causal graphs are shallow (≤6 hops, ≤50k events at maturity). PostgreSQL recursive CTEs handle all required graph traversals without the operational overhead of running a dedicated graph database. pgvector is added as an extension to store sentence embeddings directly in the articles table, avoiding a separate vector store. Migrate to Neo4j only if traversal depth or scale demands it.

### 2. Single combined Claude prompt per article
One `tool_use` call returns all of: facts array, importance score (`high`/`medium`/`low`), confidence, rationale, entity tags, and topic tags. Reduces Claude API calls from 5 → 1 per article. The system prompt (containing detailed financial scoring rubrics) is cached via `cache_control` for approximately 90% input token cost reduction on repeated calls.

### 3. Embedding pre-filter before Claude event clustering
Sending every article pair to Claude for event clustering is O(n²) in API calls. Pre-filtering with sentence-transformer cosine similarity (threshold 0.6) limits Claude to only candidate pairs that are likely matches, reducing Claude calls by ~95% on a typical news day. Embeddings are stored in pgvector for efficient ANN search.

### 4. No article body storage
Only headline, source URL, publication date, and the Claude-generated fact summary are persisted. The original article body is never stored. This avoids copyright liability for full-text storage while retaining all investment-relevant factual information.

### 5. Next.js API routes as backend proxy
Browser requests go to Next.js `/api/[...proxy]` which forwards to FastAPI internally. The FastAPI URL is never exposed to the browser. Auth headers are injected server-side. This gives a single public ingress domain and simplifies CORS configuration.

### 6. react-flow over D3 or vis-network
The admin mode requirement (inline editing of node/edge properties on the graph canvas) maps naturally to React component state. react-flow nodes are React components, so admin forms are just React components rendered inside or alongside nodes. D3 would require complex imperative DOM manipulation bridged into React.

### 7. DB-backed Celery Beat schedule
Crawl source configurations (URL, cron schedule, rate limit, enabled flag) are stored in a `crawl_sources` table. Celery Beat polls this table every 60 seconds to rebuild its schedule. Operators can add, modify, or disable crawl sources via pgAdmin without touching code or restarting any service.
