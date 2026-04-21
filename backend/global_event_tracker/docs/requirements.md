# Global Event Tracker — Requirements

## Functional

- GR-01: Group articles into events representing one distinct real-world situation
- GR-02: Two-step clustering — sentence-transformer cosine similarity pre-filter (threshold 0.6) followed by Claude judgment
- GR-03: Each event stores: `event_id`, `title`, `summary`, `start_date`, `end_date`, `importance`, `entity_tags`, `topic_tags`, `source_article_ids[]`
- GR-04: Create directed causal edges between events; store `edge_type = causal`, `confidence`, `rationale`
- GR-05: Create temporal edges between chronologically adjacent events (`edge_type = temporal`)
- GR-06: Incrementally update existing event nodes when new articles match an existing event
- GR-07: Support manual re-clustering on a date range via admin API endpoint
- GR-08: Run graph generation as a scheduled job triggered after each crawl batch

## Non-Functional

- NF-04: All configuration managed via environment variables
- NF-05: Independently deployable as a containerized service
- NF-08: Emit structured JSON logs
