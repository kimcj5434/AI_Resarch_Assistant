# Infrastructure — Architecture

## Components

| Component | Technology | Role |
|---|---|---|
| Primary DB | PostgreSQL 16 | Unified storage for table-type and graph-type data |
| Schema versioning | Alembic | DB schema version control |
| ORM | SQLAlchemy 2.0 (async) | DB access layer |
| DB GUI | pgAdmin 4 | DB inspection and manual editing |

---

## DB Schema

### Good News Board

Table: `articles`

| Column | Type | Description |
|---|---|---|
| id | BIGINT (PK, auto) | Primary key |
| headline | TEXT | Article headline |
| source | VARCHAR | News source |
| url | TEXT UNIQUE | Article URL — deduplication key |
| published_at | TIMESTAMP | Article publication time (UTC) |
| collected_at | TIMESTAMP | When the crawler collected it |
| score | INTEGER | LLM score: -1 (irrelevant), 0 (neutral), 1 (investment-positive) |
| reason | TEXT NULL | Korean investment reason — populated only when score=1 |
| is_shown | BOOLEAN | True = show in frontend. Default: score==1 for auto, True for manual |
| is_manual | BOOLEAN | True if user-added via form (bypasses LLM scoring, score fixed at 1) |

### Global Event Tracker

> Schema not yet defined — to be updated

---

## Key Design

- Single PostgreSQL instance handles both table-type and graph-type patterns
- Graph traversal handled by PostgreSQL Recursive CTEs (supports 500 nodes / 2,000 edges)
