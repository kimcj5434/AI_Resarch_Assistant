# News Scorer — Architecture

## Responsibility
- Crawl financial news sources on a configurable schedule
- Score and extract structured facts from each article using LLM Engine
- Persist article metadata and facts to PostgreSQL

## Engines Used
- Crawler Engine — fetch and extract raw article content
- LLM Engine — importance scoring + fact extraction in a single call

## Task Structure (Celery)

```
crawl_source_task
  └─► CrawlerEngine.fetch(url)
        └─► LLMEngine.score_and_extract(article)
              └─► ArticleRepository.save(article)
```

## Schedule
- Celery Beat reads crawl schedules from `crawl_sources` table (polls every 60s)
- Operators add/disable sources via pgAdmin without service restart

## Key Decisions
- No full article body stored — only headline, URL, published_at, crawled_at, language, facts JSON
- Duplicate detection: same URL or >90% headline similarity within 24h window
