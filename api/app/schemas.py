from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ArticleCreate(BaseModel):
    headline: str
    source: str
    url: str
    published_at: datetime
    reason: str


class ArticleUpdate(BaseModel):
    headline: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    reason: Optional[str] = None
    is_shown: Optional[bool] = None


class ArticleResponse(BaseModel):
    id: int
    headline: str
    source: str
    url: str
    published_at: datetime
    collected_at: datetime
    score: int
    reason: Optional[str]
    is_shown: bool
    is_manual: bool

    model_config = {"from_attributes": True}
