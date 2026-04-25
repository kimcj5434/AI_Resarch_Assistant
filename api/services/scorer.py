import asyncio
import json
import logging
import re
from dataclasses import dataclass

import anthropic

from app.config import settings, SCORER_CRITERIA_PATH

logger = logging.getLogger(__name__)

_client: anthropic.AsyncAnthropic | None = None
_criteria: str | None = None


@dataclass
class ScoreResult:
    score: int
    reason: str | None


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


def _load_criteria() -> str:
    global _criteria
    if _criteria is None:
        _criteria = SCORER_CRITERIA_PATH.read_text(encoding="utf-8")
    return _criteria


async def score_article(headline: str, url: str, retries: int = 3) -> ScoreResult:
    if not settings.anthropic_api_key:
        logger.warning("ANTHROPIC_API_KEY not set — skipping LLM scoring")
        return ScoreResult(score=0, reason=None)

    criteria = _load_criteria()
    client = _get_client()

    for attempt in range(retries):
        try:
            response = await client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=512,
                system=[
                    {
                        "type": "text",
                        "text": criteria,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                messages=[
                    {
                        "role": "user",
                        "content": f"헤드라인: {headline}\nURL: {url}",
                    }
                ],
            )

            text = response.content[0].text.strip()
            # Strip markdown code fences if present
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)

            result = json.loads(text)
            score = max(-1, min(1, int(result.get("score", 0))))
            reason = result.get("reason") if score == 1 else None
            return ScoreResult(score=score, reason=reason)

        except (anthropic.RateLimitError, anthropic.APITimeoutError) as e:
            if attempt < retries - 1:
                wait = 2 ** attempt
                logger.warning(f"LLM rate limit/timeout, retrying in {wait}s: {e}")
                await asyncio.sleep(wait)
                continue
            logger.warning(f"LLM scoring failed after {retries} attempts for {url}: {e}")
            return ScoreResult(score=0, reason=None)

        except Exception as e:
            logger.warning(f"LLM scoring error for {url}: {e}")
            return ScoreResult(score=0, reason=None)

    return ScoreResult(score=0, reason=None)
