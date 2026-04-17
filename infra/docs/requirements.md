# Infrastructure — Requirements

## Non-Functional

- NF-01: Graph view must support up to 500 nodes / 2,000 edges (PostgreSQL recursive CTEs handle all traversals)
- NF-04: All configuration (API keys, DB URLs, crawl schedules) managed via environment variables — never hard-coded
- NF-05: Each service is independently deployable via Docker Compose
- NF-08: All services emit structured JSON logs; `/health` endpoint available on all HTTP services

## Operational

- pgAdmin 4 available as a containerized service for DB inspection without writing SQL
- Docker Compose defines: postgres, redis, pgadmin, api, worker, beat, frontend
