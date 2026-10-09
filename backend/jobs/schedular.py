# jobs/scheduler.py
from jobs.reminder_schedular_job import run_reminder_scheduler
from jobs.nightly_feed_job import run_nightly_feed
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from database.session import async_session_maker
from jobs.habit_generator_job import run_habit_generator

scheduler = AsyncIOScheduler()

async def _run_habit_generator_wrapper():
    async with async_session_maker() as session:
        await run_habit_generator(session)

async def _run_nighlty_feed_wrapper():
    async with async_session_maker() as session:
        await run_nightly_feed(session)

async def _run_reminder_wrapper():
    async with async_session_maker() as session:
        await run_reminder_scheduler(session)

def start_scheduler():
    scheduler.add_job(
        _run_habit_generator_wrapper,
        trigger='cron',
        minute='*',
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
