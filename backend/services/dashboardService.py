# services/dashboardservice.py
from services.analyticsService import AnalyticsService
from app.schemas.dashboard import DashboardResponse
from app.schemas.pets import PetRead
from services.petsService import PetService
from services.todosService import TodoService
from uuid import UUID
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession

class DashboardService:
    def __init__(self, session: AsyncSession):
        self.todo_service = TodoService(session)
        self.pet_service = PetService(session)
        self.analytics_service = AnalyticsService(session)

    async def get_dashboard(self, user_id: UUID) -> DashboardResponse:
        today = date.today()

        todos = await self.todo_service.list_by_date(user_id, today)
        try:
            pet_obj = await self.pet_service.get_by_user(user_id)
            pet = PetRead.model_validate(pet_obj)
        except Exception:
            pet = None
        analytics = await self.analytics_service.get_30_day_summary(user_id)
        
        completed = sum(1 for t in todos if t.status == "completed" )

        return DashboardResponse(
            today= today,
            todos= todos,
            todos_completed=completed,
            todos_total= len(todos),
            pet= pet,
            habit_stats_30d= analytics.per_habit,
            current_streak= analytics.current_streak
        )