import logging

import yaml
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import CRAWLER_SOURCES_PATH

logger = logging.getLogger(__name__)
_scheduler: AsyncIOScheduler | None = None


def _load_interval() -> int:
    try:
        with open(CRAWLER_SOURCES_PATH) as f:
            config = yaml.safe_load(f)
        return int(config.get("crawler", {}).get("crawl_interval_hours", 24))
    except Exception:
        return 24


async def _scheduled_crawl():
    from services.crawler_pipeline import run_pipeline
    logger.info("Scheduled crawl triggered")
    await run_pipeline()


async def start_scheduler():
    global _scheduler
    interval_hours = _load_interval()
    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(
        _scheduled_crawl,
        "interval",
        hours=interval_hours,
        id="crawl_job",
        misfire_grace_time=600,
    )
    _scheduler.start()
    logger.info(f"Scheduler started — crawl every {interval_hours}h")


async def stop_scheduler():
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
