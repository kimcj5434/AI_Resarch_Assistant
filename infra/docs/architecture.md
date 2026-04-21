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

Table: `news_score`

| Column | Type | Description |
|---|---|---|
| id | BIGINT (PK, auto) | Primary key |
| headline | TEXT | Article headline |
| source | VARCHAR | News source |
| publication_date | TIMESTAMP | Publication date and time (YYYY-MM-DD HH:MM:SS) |
| url | TEXT | Article URL |
| score | INTEGER | Investment importance score |
| score_reason | TEXT | Reason for the score |
| created_at | TIMESTAMP | Collected at |
| show_frontend | BOOLEAN | Whether to display on frontend (default: true) |

### Global Event Tracker

> Schema not yet defined — to be updated

---

## Key Design

- Single PostgreSQL instance handles both table-type and graph-type patterns
- Graph traversal handled by PostgreSQL Recursive CTEs (supports 500 nodes / 2,000 edges)
