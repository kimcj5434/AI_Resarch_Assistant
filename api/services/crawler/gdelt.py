import logging
from datetime import datetime, timedelta

import httpx

from services.crawler.base import CrawlerBase, RawArticle

logger = logging.getLogger(__name__)

GDELT_API = "https://api.gdeltproject.org/api/v2/doc/doc"
QUERY = (
    "economy investment finance market earnings positive "
    "sourcelang:Korean OR sourcelang:English"
)


class GdeltCrawler(CrawlerBase):
    def __init__(self, max_records: int = 50, lookback_hours: int = 24):
        self.max_records = max_records
        self.lookback_hours = lookback_hours

    async def fetch(self) -> list[RawArticle]:
        now = datetime.utcnow()
        start = now - timedelta(hours=self.lookback_hours)

        params = {
            "query": QUERY,
            "mode": "artlist",
            "maxrecords": self.max_records,
            "format": "json",
            "startdatetime": start.strftime("%Y%m%d%H%M%S"),
            "enddatetime": now.strftime("%Y%m%d%H%M%S"),
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(GDELT_API, params=params)
                resp.raise_for_status()
                data = resp.json()
        except Exception as e:
            logger.warning(f"GDELT fetch failed: {e}")
            return []

        articles = []
        for item in data.get("articles", []):
            headline = item.get("title", "").strip()
            url = item.get("url", "").strip()
            if not headline or not url:
                continue

            published_at = self._parse_seendate(item.get("seendate", ""))
            source = item.get("domain", "GDELT")

            articles.append(RawArticle(
                headline=headline,
                url=url,
                source=source,
                published_at=published_at,
            ))

        logger.info(f"GDELT returned {len(articles)} articles")
        return articles

    def _parse_seendate(self, seendate: str) -> datetime:
        # GDELT format: 20260425T120000Z
        try:
            return datetime.strptime(seendate, "%Y%m%dT%H%M%SZ")
        except ValueError:
            return datetime.utcnow()
