# app/schemas/analytics.py
from uuid import UUID
from datetime import date
from pydantic import BaseModel

class HabitStat(BaseModel):
    habit_template_id: UUID
    title: str
    total_days_due: int
    completed_days: int
    completed_pct: float

class DailyBreakdown(BaseModel):
    todo_date: date
    total: int
    completed: int
    completed_pct: float

class AnalyticsResponse(BaseModel):
    period_start: date
    period_end: date
    overall_completion_pct: float
    current_streak: int
    per_habit: list[HabitStat]
    daily_breakdown: list[DailyBreakdown]