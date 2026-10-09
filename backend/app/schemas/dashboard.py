from app.schemas.pets import PetRead
from app.schemas.todos import TodoRead
from app.schemas.analytics import HabitStat
from datetime import date
from pydantic import BaseModel

class DashboardResponse(BaseModel):
    today: date
    todos: list[TodoRead]
    todos_completed: int
    todos_total: int
    pet: PetRead | None = None
    habit_stats_30d: list[HabitStat]
    current_streak: int