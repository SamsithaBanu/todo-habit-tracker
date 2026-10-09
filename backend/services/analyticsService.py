# services/analyticsservice.py
from uuid import UUID
from datetime import date, timedelta
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from database.models import TODOS, HABIT_TEMPLATES
from app.schemas.analytics import AnalyticsResponse, HabitStat, DailyBreakdown


class AnalyticsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_30_day_summary(self, user_id: UUID) -> AnalyticsResponse:
        end = date.today() - timedelta(days=1)      # yesterday — today isn't finished yet
        start = end - timedelta(days=29)             # 30 days inclusive

        habit_rows = await self._per_habit_stats(user_id, start, end)
        daily_rows = await self._daily_breakdown(user_id, start, end)

        per_habit = []
        for r in habit_rows:
            tot = r.total or 0
            comp = r.completed or 0
            per_habit.append(
                HabitStat(
                    habit_template_id=r.habit_template_id,
                    title=r.title,
                    total_days_due=tot,
                    completed_days=comp,
                    completed_pct=round(comp / tot * 100, 1) if tot > 0 else 0.0,
                )
            )

        daily_breakdown = []
        for r in daily_rows:
            tot = r.total or 0
            comp = r.completed or 0
            daily_breakdown.append(
                DailyBreakdown(
                    todo_date=r.todo_date,
                    total=tot,
                    completed=comp,
                    completed_pct=round(comp / tot * 100, 1) if tot > 0 else 0.0,
                )
            )

        total_todos = sum(d.total for d in daily_breakdown)
        total_completed = sum(d.completed for d in daily_breakdown)
        overall_pct = round(total_completed / total_todos * 100, 1) if total_todos else 0.0

        streak = self._calculate_streak(daily_breakdown)

        return AnalyticsResponse(
            period_start=start,
            period_end=end,
            overall_completion_pct=overall_pct,
            current_streak=streak,
            per_habit=per_habit,
            daily_breakdown=daily_breakdown,
        )

    async def _per_habit_stats(self, user_id: UUID, start: date, end: date):
        stmt = (
            select(
                HABIT_TEMPLATES.id.label("habit_template_id"),
                HABIT_TEMPLATES.title,
                func.count(TODOS.id).label("total"),
                func.sum(case((TODOS.status == "completed", 1), else_=0)).label("completed"),
            )
            .select_from(HABIT_TEMPLATES)
            .outerjoin(
                TODOS,
                (TODOS.habit_template_id == HABIT_TEMPLATES.id)
                & (TODOS.todo_date.between(start, end)),
            )
            .where(HABIT_TEMPLATES.user_id == user_id, HABIT_TEMPLATES.is_active == True)  # noqa: E712
            .group_by(HABIT_TEMPLATES.id, HABIT_TEMPLATES.title)
        )
        result = await self.session.execute(stmt)
        return result.all()

    async def _daily_breakdown(self, user_id: UUID, start: date, end: date):
        stmt = (
            select(
                TODOS.todo_date,
                func.count(TODOS.id).label("total"),
                func.sum(case((TODOS.status == "completed", 1), else_=0)).label("completed"),
            )
            .where(TODOS.user_id == user_id, TODOS.todo_date.between(start, end))
            .group_by(TODOS.todo_date)
            .order_by(TODOS.todo_date)
        )
        result = await self.session.execute(stmt)
        return result.all()

    def _calculate_streak(self, daily_breakdown: list[DailyBreakdown]) -> int:
        streak = 0
        print(f'streak {daily_breakdown}')
        for day in reversed(daily_breakdown):
            if day.total > 0 and day.completed == day.total:
                streak += 1
            else:
                break
        return streak