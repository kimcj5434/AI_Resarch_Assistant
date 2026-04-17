# Requirements & Key Features

## Overview

An investment news research assistant that crawls financial news, extracts copyright-safe facts, builds an event-based causal knowledge graph, and visualizes it as an interactive web application. The goal is to present the current state of investment-relevant market events at a glance.

---

## Functional Requirements

### Crawler

| ID | Requirement |
|---|---|
| CR-01 | Crawl news articles from multiple sources: Korean financial portals (Naver Finance, Korea Economic Daily, Maeil Business) and global sources (Reuters, Bloomberg, Yahoo Finance) via RSS and web |
| CR-02 | Store per article: `source_url`, `headline`, `published_at`, `crawled_at`, `language` — do NOT store full article body |
| CR-03 | Extract copyright-safe fact summaries from articles using Claude API; store as structured JSON alongside headline, URL, and publication date |
| CR-04 | Score each article's investment importance as `high`, `medium`, or `low` with a numeric confidence score (0.0–1.0) and a short rationale (max 200 chars) using Claude API |
| CR-05 | Detect and skip duplicate articles (same URL, or >90% headline similarity within 24h window) |
| CR-06 | Support configurable crawl schedules per source (e.g., top sources every 15 min, others every 2h); schedules managed via DB without service restarts |
| CR-07 | Handle both Korean and English articles; Claude performs language detection and summarizes in English regardless of source language |
| CR-08 | Retry failed crawl attempts up to 3 times with exponential backoff; mark as `failed` and log after exhausting retries |
| CR-09 | Respect `robots.txt` and configurable per-domain minimum request intervals (default: 5 seconds) |
| CR-10 | Provide a DB GUI (pgAdmin 4) for operators to view, filter, and manually edit article records and importance scores |

### Graph Generator

| ID | Requirement |
|---|---|
| GR-01 | Group articles into "events" using semantic clustering — an event represents one distinct real-world situation (e.g., "Fed rate hike decision Q1 2026") |
| GR-02 | Cluster articles into events using a two-step process: sentence-transformer cosine similarity pre-filter (threshold 0.6) followed by authoritative Claude judgment |
| GR-03 | Each event node stores: `event_id`, `title`, `summary`, `start_date`, `end_date`, `importance`, `entity_tags` (companies, people, indices), `topic_tags` (macro, earnings, M&A, regulatory, etc.), `source_article_ids[]` |
| GR-04 | Create directed causal edges between events where Claude determines Event A likely influenced Event B; store `edge_type = causal`, `confidence`, and `rationale` |
| GR-05 | Automatically create temporal edges between chronologically adjacent events (`edge_type = temporal`) even without direct causal relationship, to show time flow |
| GR-06 | Incrementally update existing event nodes (add new source articles) rather than creating duplicates when new articles match an existing event |
| GR-07 | Support manual re-clustering (re-run event grouping on a date range) via an admin API endpoint |
| GR-08 | Run graph generation as a scheduled job triggered after each crawl batch completes |

### Web UI

| ID | Requirement |
|---|---|
| UI-01 | Build with Next.js (App Router) + TypeScript |
| UI-02 | Display events as interactive nodes and relationships as directed edges using react-flow |
| UI-03 | Node visual encoding: size proportional to importance score; color by topic tag (macro=blue, earnings=green, M&A=orange, regulatory=red, other=gray) |
| UI-04 | Edge visual encoding: solid line for causal edges, dashed line for temporal edges; line weight proportional to confidence score |
| UI-05 | Clicking a node opens a detail panel: event title, summary, date range, importance, entity tags, topic tags, and source article list with links |
| UI-06 | Timeline filter (date range picker) to show only events within a selected window |
| UI-07 | Filter by importance level (high/medium/low toggles) and topic tags (multi-select) |
| UI-08 | Admin mode (token-gated login) with full CRUD: edit node/edge properties, add/delete nodes and edges, merge two event nodes |
| UI-09 | Separate "Articles" list view with sortable columns, filters by date/importance/source, and source URL links |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NF-01 | Graph view renders up to 500 nodes / 2,000 edges at 30+ fps on a modern desktop browser |
| NF-02 | Backend graph API responds in under 500ms for graphs up to 1,000 nodes |
| NF-03 | Prompt caching (`cache_control`) reduces Claude input token cost by ~90% on repeated calls |
| NF-04 | All configuration (API keys, DB URLs, crawl schedules) managed via environment variables — never hard-coded |
| NF-05 | Each service (crawler, graph, api, frontend) is independently deployable |
| NF-06 | Admin API endpoints require authentication; Claude API keys are never exposed to the browser |
| NF-07 | Fact extraction + importance scoring handled in a single Claude API call per article to minimize cost |
| NF-08 | All services emit structured JSON logs; a `/health` endpoint is available on all HTTP services |

---

## Key Features

### 1. Investment-Focused News Crawler
Continuously crawls Korean and global financial news. Uses Claude to score investment relevance (high/medium/low) and extract structured facts — storing only the facts and metadata, not the full article body, to avoid copyright issues.

### 2. Event-Based Knowledge Graph
Groups related news articles into discrete "events" using a hybrid embedding + LLM clustering approach. Events become the nodes of a knowledge graph.

### 3. Causal & Temporal Graph Edges
Edges represent either causal influence (Event A caused Event B, inferred by Claude) or temporal succession (Event A preceded Event B). This dual-edge model shows both what happened and why.

### 4. Interactive Graph Visualization
A react-flow canvas renders the event graph with automatic dagre DAG layout. Nodes encode importance (size) and topic (color). Edges encode type (solid/dashed) and confidence (weight).

### 5. Admin Graph Editor
Authenticated admin mode allows operators to edit node/edge properties, add/delete nodes and edges, and merge duplicate events directly on the graph canvas.

### 6. Article List View
A filterable, sortable table of all crawled articles with importance scores and direct links to original sources.

### 7. DB GUI (pgAdmin)
pgAdmin 4 runs as a containerized service, giving operators direct access to the database for inspection and manual corrections without writing SQL.

---

## Out of Scope (Initial Version)

- User accounts / multi-user authentication (admin is a single shared token)
- Real-time push updates to the graph (polling is acceptable)
- Automated trading signals or portfolio management features
- Mobile-optimized layout
- Paid data sources or licensed news APIs
