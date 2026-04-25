from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Article
from app.schemas import ArticleCreate, ArticleUpdate, ArticleResponse

router = APIRouter()


@router.get("/articles", response_model=list[ArticleResponse])
async def list_articles(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    source: Optional[str] = None,
    is_shown: Optional[bool] = True,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    conditions = []
    if is_shown is not None:
        conditions.append(Article.is_shown == is_shown)
    if date_from:
        conditions.append(Article.published_at >= date_from)
    if date_to:
        conditions.append(Article.published_at <= date_to)
    if source:
        conditions.append(Article.source == source)

    stmt = (
        select(Article)
        .where(and_(*conditions) if conditions else True)
        .order_by(Article.published_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await session.execute(stmt)
    return result.scalars().all()


@router.post("/articles", response_model=ArticleResponse, status_code=201)
async def create_article(
    data: ArticleCreate,
    session: AsyncSession = Depends(get_session),
):
    existing = await session.execute(select(Article).where(Article.url == data.url))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Article with this URL already exists")

    article = Article(
        headline=data.headline,
        source=data.source,
        url=data.url,
        published_at=data.published_at,
        reason=data.reason,
        score=1,
        is_shown=True,
        is_manual=True,
    )
    session.add(article)
    await session.commit()
    await session.refresh(article)
    return article


@router.patch("/articles/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: int,
    data: ArticleUpdate,
    session: AsyncSession = Depends(get_session),
):
    article = await session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(article, field, value)

    await session.commit()
    await session.refresh(article)
    return article


@router.delete("/articles/{article_id}", status_code=204)
async def delete_article(
    article_id: int,
    session: AsyncSession = Depends(get_session),
):
    article = await session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    await session.delete(article)
    await session.commit()
