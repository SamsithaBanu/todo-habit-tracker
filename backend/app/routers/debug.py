# routers/debug.py — TEMPORARY, remove before real production launch
#
# Lets you manually fire each scheduled job right now, instead of waiting
# for the exact minute/timezone match. Add this to main.py:
#   from routers import debug as debug_router
#   app.include_router(debug_router.router, prefix="/api/debug", tags=["debug"])
#
# IMPORTANT: this has no auth check — anyone could hit it. Fine for testing
# on a throwaway/dev deployment, but delete this file (and its include_router
# line) before you consider the app "done."

from jobs.reminder_schedular_job import run_reminder_scheduler
from fastapi import APIRouter
from database.session import async_session_maker
from jobs.habit_generator_job import run_habit_generator
from jobs.nightly_feed_job import run_nightly_feed

debug_router = APIRouter(prefix='/api/debug', tags=["debug"])


@debug_router.post("/run-habit-generator")
async def trigger_habit_generator():
    async with async_session_maker() as session:
        await run_habit_generator(session)
    return {"detail": "habit_generator_job ran"}


@debug_router.post("/run-nightly-feed")
async def trigger_nightly_feed():
    async with async_session_maker() as session:
        await run_nightly_feed(session)
    return {"detail": "nightly_feed_job ran"}


@debug_router.post("/run-reminder-scheduler")
async def trigger_reminder_scheduler():
    async with async_session_maker() as session:
        await run_reminder_scheduler(session, force=True)
    return {"detail": "reminder_scheduler_job ran"}