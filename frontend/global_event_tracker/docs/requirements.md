# Global Event Tracker Frontend — Requirements

## Functional

- UI-01: Build with Next.js (App Router) + TypeScript
- UI-02: Display events as interactive nodes and relationships as directed edges using react-flow
- UI-03: Node encoding — size proportional to importance; color by topic (macro=blue, earnings=green, M&A=orange, regulatory=red, other=gray)
- UI-04: Edge encoding — solid line for causal, dashed for temporal; weight proportional to confidence
- UI-05: Clicking a node opens a detail panel: title, summary, date range, importance, entity tags, topic tags, source article links
- UI-06: Timeline filter (date range picker)
- UI-07: Filter by importance level and topic tags (multi-select)
- UI-08: Admin mode (token-gated): edit node/edge properties, add/delete nodes and edges, merge two event nodes

## Non-Functional

- NF-01: Graph view renders up to 500 nodes / 2,000 edges at 30+ fps on a modern desktop browser
- NF-05: Independently deployable as a containerized service
