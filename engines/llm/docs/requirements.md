# LLM Engine — Requirements

## Functional

- CR-03: Extract copyright-safe fact summaries as structured JSON
- CR-04: Score investment importance as `high` / `medium` / `low` with confidence (0.0–1.0) and rationale (max 200 chars)
- CR-07: Detect language and summarize in English regardless of source language

## Non-Functional

- NF-03: `cache_control` on system prompts reduces input token cost by ~90%
- NF-07: Fact extraction + importance scoring handled in a single API call per article
