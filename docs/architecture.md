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

## Workflow

```
[Crawler Engine]──┐
                  ▼
[LLM Engine]──► [News Scorer]   ← Celery worker (데이터 생산)
                  │
                  ▼
              [PostgreSQL]
                  ▲
[LLM Engine]──► [Global Event Tracker]  ← Celery worker (데이터 생산)

              [PostgreSQL]
                  │
                  ▼
            [API / FastAPI]             ← 데이터 노출, 인증
                  │
                  ▼
             [Frontend]                 ← UI 제공
```

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
│   ├── good_news_collector/
│   │   └── docs/
│   └── global_event_tracker/
│       └── docs/
└── infra/
    └── docs/
```
