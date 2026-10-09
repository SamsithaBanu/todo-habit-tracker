from services.pushservice import PushService
from jobs.habit_generator_job import _get_all_active_users
from core.timezone_utils import is_local_time
from sqlalchemy.ext.asyncio import AsyncSession

async def run_reminder_scheduler(session: AsyncSession) -> None:
    users = await _get_all_active_users(session)
    push_service = PushService(session)

    for user in users:
        morning = user.reminder_morning_time.strftime("%H:%M")
        evening = user.reminder_evening_time.strftime("%H:%M")

        if is_local_time(user.timezone, morning):
            await push_service.send_to_user(
                user.id, "Time to plan your day", "Add today's todos before you get busy."
            )

        if is_local_time(user.timezone, evening):
            await push_service.send_to_user(
                user.id, "Don't forget your pet", "Update your todos — your companion is waiting to be fed."
            )