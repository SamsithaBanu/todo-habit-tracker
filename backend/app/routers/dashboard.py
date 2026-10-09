from app.dependencies import DashboardServiceDep
from app.dependencies import UserDep
from app.schemas.dashboard import DashboardResponse
from fastapi import APIRouter

dashboard_router = APIRouter(prefix='/api/dashboard', tags=['dashboard'])

@dashboard_router.get('', response_model=DashboardResponse)
@dashboard_router.get('/', response_model=DashboardResponse)
async def get_dashboard(user: UserDep, service:DashboardServiceDep):
    return await service.get_dashboard(user.id)