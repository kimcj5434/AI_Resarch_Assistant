# Architecture

## Layer Structure

| Layer | Components |
|---|---|
| Infrastructure | PostgreSQL 16 + pgvector, Redis, Docker Compose, Alembic |
| Engine | Crawler Engine, LLM Engine |
| Service | News Scorer, Global Event Tracker |
| API | FastAPI |
| Client | Frontend (Next.js) |

---

## Engine Usage by Service

| Service | Engines Used |
|---|---|
| News Scorer | Crawler Engine, LLM Engine |
| Global Event Tracker | LLM Engine, sentence-transformers (embedding) |

---

## Directory Structure

```
AI_Research_Assistant/
├── README.md
├── docs/
│   └── architecture.md
├── engines/
│   ├── crawler/
│   │   └── docs/
│   └── llm/
│       └── docs/
├── services/
│   ├── news_scorer/
│   │   └── docs/
│   └── global_event_tracker/
│       └── docs/
├── api/
│   └── docs/
├── frontend/
│   ├── good_news_board/
│   │   └── docs/
│   └── global_event_tracker/
│       └── docs/
└── infra/
    └── docs/
```
