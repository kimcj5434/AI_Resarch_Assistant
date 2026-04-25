from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime


@dataclass
class RawArticle:
    headline: str
    url: str
    source: str
    published_at: datetime


class CrawlerBase(ABC):
    @abstractmethod
    async def fetch(self) -> list[RawArticle]:
        ...
