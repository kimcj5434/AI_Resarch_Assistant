# Infrastructure — Requirements

## DB Requirements

- DB-01: `news_score` table schema follows the definition in architecture.md
- DB-02: Graph-type data implemented with PostgreSQL nodes/edges tables + Recursive CTEs
- DB-03: All backends share a single PostgreSQL instance

## Non-Functional

- NF-01: Graph view must support up to 500 nodes / 2,000 edges
- NF-04: All configuration (API keys, DB URLs) managed via environment variables — never hard-coded

## Operational

- pgAdmin 4 available for DB inspection without writing SQL
