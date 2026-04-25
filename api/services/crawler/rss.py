import asyncio
import logging
from datetime import datetime
from email.utils import parsedate_to_datetime

import feedparser

from services.crawler.base import CrawlerBase, RawArticle

logger = logging.getLogger(__name__)


class RssCrawler(CrawlerBase):
    def __init__(self, name: str, url: str):
        self.name = name
        self.feed_url = url

    async def fetch(self) -> list[RawArticle]:
        try:
            # feedparser is synchronous — run in thread to avoid blocking event loop
            feed = await asyncio.to_thread(feedparser.parse, self.feed_url)
        except Exception as e:
            logger.warning(f"RSS fetch failed for {self.name}: {e}")
            return []

        articles = []
        for entry in feed.entries:
            headline = entry.get("title", "").strip()
            url = entry.get("link", "").strip()
            if not headline or not url:
                continue

            published_at = self._parse_published(entry)
            articles.append(RawArticle(
                headline=headline,
                url=url,
                source=self.name,
                published_at=published_at,
            ))

        return articles

    def _parse_published(self, entry) -> datetime:
        published = entry.get("published", "")
        try:
            return parsedate_to_datetime(published).replace(tzinfo=None)
        except Exception:
            return datetime.utcnow()
