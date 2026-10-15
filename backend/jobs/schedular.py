# jobs/scheduler.py
import logging
from jobs.reminder_schedular_job import run_reminder_scheduler
from jobs.nightly_feed_job import run_nightly_feed
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from database.session import async_session_maker
from jobs.habit_generator_job import run_habit_generator

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def _run_habit_generator_wrapper():
    logger.info("[Scheduler] Running habit_generator job")
    async with async_session_maker() as session:
        try:
            await run_habit_generator(session)
            logger.info("[Scheduler] habit_generator job completed")
        except Exception:
            logger.exception("[Scheduler] habit_generator_job failed")

async def _run_nighlty_feed_wrapper():
    logger.info("[Scheduler] Running nightly_feed job")
    async with async_session_maker() as session:
        try:
            await run_nightly_feed(session)
            logger.info("[Scheduler] nightly_feed job completed")
        except Exception:
            logger.exception("[Scheduler] nightly_feed_job failed")

async def _run_reminder_wrapper():
    logger.info("[Scheduler] Running reminder job")
    async with async_session_maker() as session:
        try:
            await run_reminder_scheduler(session)
            logger.info("[Scheduler] reminder job completed")
        except Exception:
            logger.exception("[Scheduler] reminder_job failed")


def start_scheduler():
    scheduler.add_job(
        _run_habit_generator_wrapper,
        trigger='cron',
        minute="*",
        id="habit_generator",
        replace_existing=True
    ),
    scheduler.add_job(
        _run_nighlty_feed_wrapper,
        trigger='cron',
        minute='*',
        id="nightly_feed",
        replace_existing=True
    ),
    scheduler.add_job(
        _run_reminder_wrapper,
        trigger='cron',
        minute='*',
        id="reminders",
        replace_existing=True
    )
    scheduler.start()
