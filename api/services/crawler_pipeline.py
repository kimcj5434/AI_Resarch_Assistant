import logging
from datetime import datetime

import yaml
from sqlalchemy import select

from app.config import CRAWLER_SOURCES_PATH
from app.database import AsyncSessionLocal
from app.models import Article
from services.crawler.base import RawArticle
from services.crawler.gdelt import GdeltCrawler
from services.crawler.rss import RssCrawler
from services.scorer import score_article

logger = logging.getLogger(__name__)


def _load_sources() -> tuple[list[dict], int]:
    try:
        with open(CRAWLER_SOURCES_PATH) as f:
            config = yaml.safe_load(f)
        sources = [s for s in config.get("sources", []) if s.get("enabled", False)]
        interval = int(config.get("crawler", {}).get("crawl_interval_hours", 24))
        return sources, interval
    except Exception as e:
        logger.warning(f"Could not load crawler sources: {e}")
        return [], 24


async def _dedup(session, articles: list[RawArticle]) -> list[RawArticle]:
    if not articles:
        return []
    urls = [a.url for a in articles]
    result = await session.execute(select(Article.url).where(Article.url.in_(urls)))
    existing_urls = {row[0] for row in result}
    return [a for a in articles if a.url not in existing_urls]


async def run_pipeline():
    logger.info("Crawl pipeline starting")
    sources, _ = _load_sources()
    all_articles: list[RawArticle] = []

    for source in sources:
        source_type = source.get("type", "")
        name = source.get("name", "unknown")
        try:
            if source_type == "gdelt":
                crawler = GdeltCrawler(
                    max_records=source.get("max_records", 50),
                    lookback_hours=source.get("lookback_hours", 24),
                )
                fetched = await crawler.fetch()
                all_articles.extend(fetched)
                logger.info(f"{name}: fetched {len(fetched)} articles")

            elif source_type == "rss":
                url = source.get("url", "")
                if url:
                    crawler = RssCrawler(name=name, url=url)
                    fetched = await crawler.fetch()
                    all_articles.extend(fetched)
                    logger.info(f"{name}: fetched {len(fetched)} articles")

        except Exception as e:
            logger.warning(f"Crawler error for {name}: {e}")

    if not all_articles:
        logger.info("No articles fetched — pipeline done")
        return

    async with AsyncSessionLocal() as session:
        new_articles = await _dedup(session, all_articles)
        logger.info(f"New articles after dedup: {len(new_articles)} / {len(all_articles)}")

        saved = 0
        for raw in new_articles:
            try:
                result = await score_article(raw.headline, raw.url)
                article = Article(
                    headline=raw.headline,
                    source=raw.source,
                    url=raw.url,
                    published_at=raw.published_at,
                    collected_at=datetime.utcnow(),
                    score=result.score,
                    reason=result.reason,
                    is_shown=(result.score == 1),
                    is_manual=False,
                )
                session.add(article)
                saved += 1
            except Exception as e:
                logger.warning(f"Failed to process {raw.url}: {e}")

        await session.commit()
        logger.info(f"Crawl pipeline complete — saved {saved} articles")
