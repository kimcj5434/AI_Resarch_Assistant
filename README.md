# AI Research Assistant

An investment news research assistant that continuously monitors financial markets, extracts structured insights, and visualizes causal relationships between market events.

---

## Services

### Good News Collector
- Crawls Korean and global financial news sources (RSS + web)
- Scores investment importance (high / medium / low) using Claude API
- Extracts copyright-safe fact summaries — no full article body stored
- Deduplicates articles and handles retries with exponential backoff

### Global Event Tracker
- Groups related articles into discrete market events via semantic clustering
- Infers causal and temporal edges between events using Claude API
- Incrementally updates events as new articles arrive
- Builds a queryable knowledge graph stored in PostgreSQL

---

## Key Features

- Hybrid clustering: sentence-transformer pre-filter + Claude LLM judgment reduces API calls by ~95%
- Single Claude prompt per article: importance score + fact extraction + entity tags in one call
- Prompt caching (`cache_control`) reduces Claude input token cost by ~90%
- DB-backed Celery Beat schedule: add/disable sources without service restarts
- Admin mode: inline graph editing, node merge, CRUD on events and edges
- pgAdmin 4 for direct DB inspection without writing SQL

---

## Expected Outcomes

- Real-time visibility into high-impact investment events across Korean and global markets
- Causal graph reveals *why* markets moved, not just *what* happened
- Low operational cost through aggressive prompt caching and embedding pre-filtering
- Operators can manage crawl sources and review data without engineering support
