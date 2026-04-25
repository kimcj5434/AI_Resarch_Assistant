from datetime import datetime
from sqlalchemy import Integer, String, DateTime, Boolean, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    headline: Mapped[str] = mapped_column(String(1000), nullable=False)
    source: Mapped[str] = mapped_column(String(200), nullable=False)
    url: Mapped[str] = mapped_column(String(2000), unique=True, nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    collected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_shown: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_manual: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
