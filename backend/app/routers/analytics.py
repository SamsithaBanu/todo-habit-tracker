# routers/analytics.py
from app.dependencies import AnalyticsServiceDep
from app.dependencies import UserDep
from fastapi import APIRouter
from app.schemas.analytics import AnalyticsResponse

analytics_router = APIRouter()

@analytics_router.get("/summary", response_model=AnalyticsResponse)
async def get_analytics(user: UserDep, service:AnalyticsServiceDep):
    return await service.get_30_day_summary(user.id)