import asyncio
import logging
from fastapi import APIRouter, BackgroundTasks

router = APIRouter()
logger = logging.getLogger(__name__)

_crawl_running = False


async def _run_crawl():
    global _crawl_running
    if _crawl_running:
        logger.info("Crawl already running — skipping")
        return
    _crawl_running = True
    try:
        from services.crawler_pipeline import run_pipeline
        await run_pipeline()
    except Exception as e:
        logger.error(f"Crawl pipeline error: {e}")
    finally:
        _crawl_running = False


@router.post("/crawl/run", status_code=202)
async def trigger_crawl(background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_crawl)
    return {"status": "crawl started"}
