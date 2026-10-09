from services.pushservice import PushService
from services.analyticsService import AnalyticsService
from services.dashboardService import DashboardService
from services.petsService import PetService
from services.habitservice import HabitService
from fastapi import BackgroundTasks
from database.models import USERSS
from core.security import oauth2_scheme_user
from database.redis import is_jti_blacklisted
from utils import decode_access_token
from database.session import get_session
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, status, HTTPException
from services.userservice import UserService
from services.todosService import TodoService
from uuid import UUID

SessionDep = Annotated[
    AsyncSession,
    Depends(get_session)
]

def get_user_service(session: SessionDep, tasks: BackgroundTasks)->UserService:
    return UserService(session, tasks)

UserServiceDep = Annotated[
    UserService,
    Depends(get_user_service)
]

async def _get_access_token(token: str) -> dict:
    data = decode_access_token(token)

    if data is None or await is_jti_blacklisted(data.get('jti','')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail ='Invalid or expired token'
        )
    
    return data

async def get_user_access_token(
    token: Annotated[
        str, 
        Depends(oauth2_scheme_user)
    ]
) -> dict:
    return await _get_access_token(token)

async def get_current_user(
    token_data: Annotated[
        dict,
        Depends(get_user_access_token)
    ],
    session: SessionDep
)->USERSS:
    user_id_str = token_data.get("user",{}).get('id')

    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    try:
        user_id = UUID(user_id_str)

    except(ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )
    
    user = await session.get(USERSS, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is not found or unauthorized!"
        )
    
    return user

UserDep = Annotated[
    USERSS,
    Depends(get_current_user)
]

def get_todo_service(session: SessionDep) -> TodoService:
    return TodoService(session)

def get_habit_service(session: SessionDep) -> HabitService:
    return HabitService(session)


def get_pet_service(session: SessionDep) -> PetService:
    return PetService(session)

def get_dashboard_service(session: SessionDep) -> DashboardService:
    return DashboardService(session)

def get_analytics_service(session: SessionDep) -> AnalyticsService:
    return AnalyticsService(session)

def push_subscription_service(session: SessionDep) -> PushService:
    return PushService(session)

TodoServiceDep = Annotated[TodoService, Depends(get_todo_service)]
HabitServiceDep = Annotated[HabitService, Depends(get_habit_service)]
PetServiceDep = Annotated[PetService, Depends(get_pet_service)]
DashboardServiceDep = Annotated[DashboardService, Depends(get_dashboard_service)]
AnalyticsServiceDep = Annotated[AnalyticsService, Depends(get_analytics_service)]
PushSubscriptionServiceDep = Annotated[PushService, Depends(push_subscription_service)]