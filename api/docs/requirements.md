# API — Requirements

## Functional

- Expose endpoints for articles, events, edges, and crawl sources
- Support filtering by date range, importance, topic tags, and source
- Admin endpoints (CRUD for events, edges, sources) require authentication
- Manual re-cluster endpoint: `POST /admin/graph/recluster?start=&end=`

## Non-Functional

- NF-02: Graph API responds in under 500ms for graphs up to 1,000 nodes
- NF-06: Admin endpoints require authentication; Claude API keys never exposed to browser
- NF-08: `/health` endpoint available; emit structured JSON logs
