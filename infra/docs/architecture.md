# Infrastructure — Architecture

## Components

| Component | Technology | Role |
|---|---|---|
| Primary DB | PostgreSQL 16 + pgvector | Article storage, event/edge graph, sentence embeddings |
| Task broker | Redis | Celery message broker and result backend |
| Migrations | Alembic | Schema versioning (authoritative source) |
| ORM | SQLAlchemy 2.0 (async) | Shared across all Python services |
| Containerization | Docker Compose | Orchestrates all services |
| DB GUI | pgAdmin 4 | Operator DB inspection and manual edits |

## Key Design

- pgvector stores sentence embeddings directly in the articles table — no separate vector store needed
- Alembic migrations live in `good_news_collector` service (authoritative schema owner)
- All services connect to a single PostgreSQL instance via shared environment variables
