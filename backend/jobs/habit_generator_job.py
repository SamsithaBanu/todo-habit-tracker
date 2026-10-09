from database.models import TODOS
from services.habitservice import HabitService
from services.todosService import TodoService
from core.timezone_utils import get_user_local_weekday
from core.timezone_utils import get_user_local_date
from core.timezone_utils import is_local_time
from sqlalchemy import select
from database.models import USERSS
from sqlalchemy.ext.asyncio import AsyncSession
import logging

logger = logging.getLogger(__name__)


async def _get_all_active_users(session: AsyncSession) -> list[USERSS]:
    result = await session.execute(select(USERSS).where(USERSS.is_verified == True))  # noqa: E712
    return result.scalars().all()

async def run_habit_generator(session: AsyncSession) -> None:
    """
    Runs every minute (via APScheduler). For each user whose local time is
    exactly 00:00, generates today's todos from their active habit templates.
    Idempotent: skips habits that already have a todo for that date, and the
    DB's UniqueConstraint on (user_id, habit_template_id, todo_date) is the
    final safety net if this check is ever bypassed.
    """
    habit_service = HabitService(session)
    todo_service = TodoService(session)

    users = await _get_all_active_users(session)

    for user in users:
        if not is_local_time(user.timezone, "00:00"):
            continue

        today = get_user_local_date(user.timezone)
        weekday = get_user_local_weekday(user.timezone)

        due_habits = await habit_service.list_due_today(user.id, weekday)

        for habit in due_habits:
            exists = await todo_service._already_generated(user.id, habit.id, today)
            if exists:
                continue

            todo = TODOS(
                user_id=user.id,
                habit_template_id=habit.id,
                title=habit.title,
                todo_date=today,
                status="pending",
            )
            session.add(todo)
            logger.info(f"Generated todo '{habit.title}' for user {user.id} on {today}")

    await session.commit()