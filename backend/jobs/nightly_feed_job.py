
from datetime import timedelta
from core.timezone_utils import get_user_local_date
from core.timezone_utils import is_local_time
from services.petsService import PetService
from jobs.habit_generator_job import _get_all_active_users
from database.models import TODOS
from database.models import DAILY_SUMMARIES
from sqlalchemy import select
from sqlmodel import UUID
from sqlalchemy.ext.asyncio import AsyncSession
import logging

logger = logging.getLogger(__name__)

FEED_RULES = [
    {"min": 100, "feed": "full",    "delta": +15},
    {"min": 80,  "feed": "average", "delta": +8},
    {"min": 50,  "feed": "small",   "delta": 0},
    {"min": 1,   "feed": "barely",  "delta": -15},
    {"min": 0,   "feed": "none",    "delta": -25},
]

async def _already_summarized(session: AsyncSession, user_id: UUID, summary_date) ->bool:
    result = await session.execute(
        select(DAILY_SUMMARIES).where(
            DAILY_SUMMARIES.user_id == user_id, 
            DAILY_SUMMARIES.summary_date == summary_date
        )
    )
    return result.scalar_one_or_none is not None

async def _count_todos(session: AsyncSession, user_id: UUID, todo_date) ->tuple[int, int]:
    result = await session.execute(
        select(TODOS.status).where(TODOS.user_id == user_id, TODOS.todo_date == todo_date)
    )
    statuses = result.scalars().all()
    total = len(statuses)
    completed = sum(1 for s in statuses if s =="completed")
    return total, completed

def _match_rule(pct: float) -> dict:
    for rule in FEED_RULES:
        if pct >= rule["min"]:
            return rule
    return FEED_RULES[-1]  # fallback, should never actually hit this

async def run_nightly_feed(session: AsyncSession) -> None:
    """
    Runs every minute. For each user whose local time is exactly 00:00,
    grades yesterday's completion %, records a daily_summaries row, and
    updates pet health. Idempotent via the (user_id, summary_date) unique
    check + DB constraint.
    """

    users = await _get_all_active_users(session)
    pet_service = PetService(session)

    for user in users:
        if not is_local_time(user.timezone, "00:00"):
            continue

        today = get_user_local_date(user.timezone)
        yesterday = today - timedelta(days=1)

        if await _already_summarized(session, user.id, yesterday):
            continue

        total, completed = await _count_todos(session, user.id, yesterday)
        pct = (completed / total * 100) if total else 0.0
        rule = _match_rule(pct)

        summary = DAILY_SUMMARIES(
            user_id=user.id,
            summary_date=yesterday,
            total_todos=total,
            completed_todos=completed,
            completion_pct=round(pct, 2),
            feed_level=rule["feed"],
            health_delta=rule["delta"],
        )
        session.add(summary)
        await session.commit()   # commit summary first — this alone guards idempotency

        try:
            await pet_service.apply_health_delta(user.id, rule["delta"])
        except Exception:
            logger.exception(f"Failed to update pet health for user {user.id} on {yesterday}")

        logger.info(f"User {user.id}: {yesterday} = {pct:.1f}% -> {rule['feed']} ({rule['delta']:+d} health)")