from app.routers.push import push_router
from app.routers.analytics import analytics_router
from app.routers.dashboard import dashboard_router
from app.routers.pets import pet_router
from app.routers.habit_template import habit_router
from app.routers.todos import todo_router
from app.routers.users import user_router
from fastapi import APIRouter

master_router = APIRouter()

master_router.include_router(user_router)
master_router.include_router(todo_router)
master_router.include_router(habit_router)
master_router.include_router(pet_router)
master_router.include_router(dashboard_router)
master_router.include_router(analytics_router)
master_router.include_router(push_router)