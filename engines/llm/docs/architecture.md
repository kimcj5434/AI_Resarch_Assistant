# LLM Engine — Architecture

## Responsibility
- Manage all Anthropic API interactions
- Handle prompt construction, caching, and response parsing

## Tech Stack

| Component | Technology |
|---|---|
| SDK | `anthropic` (Python) |
| Default model | `claude-sonnet-4-6` |
| Fast/cheap model | `claude-haiku-4-5` |
| Cost optimization | `cache_control` on system prompts |
| Response schema | `tool_use` (structured JSON output) |

## Key Design

- System prompts are marked with `cache_control` → ~90% input token cost reduction on repeated calls
- Single `tool_use` call per article returns: facts, importance score, confidence, rationale, entity tags, topic tags
- Prompt templates are versioned and stored separately from client code
