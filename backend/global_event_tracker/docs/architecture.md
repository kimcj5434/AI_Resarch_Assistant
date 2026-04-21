# Global Event Tracker — Architecture

## Responsibility
- Cluster related articles into discrete market events
- Infer causal and temporal edges between events
- Persist the event knowledge graph to PostgreSQL

## Engines Used
- LLM Engine — authoritative event clustering judgment + causal edge inference
- `sentence-transformers` (`paraphrase-multilingual-MiniLM-L12-v2`) — embedding pre-filter

## Task Structure (Celery)

```
cluster_task (triggered after each crawl batch)
  └─► EmbeddingEncoder.encode(articles)
        └─► CosineSimilarityFilter.filter(pairs, threshold=0.6)
              └─► LLMEngine.cluster(candidate_pairs)
                    └─► EventRepository.upsert(events)

edge_inference_task
  └─► LLMEngine.infer_edges(event_pairs)
        └─► EdgeRepository.save(edges)
```

## Key Decisions
- Embedding pre-filter (threshold 0.6) reduces Claude clustering calls by ~95%
- Embeddings stored in pgvector for efficient ANN search
- Temporal edges created automatically between chronologically adjacent events
- Incremental update: new articles merged into existing events rather than duplicating
