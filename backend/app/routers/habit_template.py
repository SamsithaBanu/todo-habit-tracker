from app.dependencies import HabitServiceDep
from app.dependencies import UserDep
from uuid import UUID
from fastapi import APIRouter, Depends
from app.schemas.habit_template import HabitTemplateCreate, HabitTemplateUpdate, HabitTemplateRead

habit_router = APIRouter(prefix='/api/habit', tags=['habits'])

@habit_router.get('', response_model=list[HabitTemplateRead])
async def list_habits(user: UserDep, service: HabitServiceDep):
    return await service.list_by_user(user.id)

@habit_router.post("", response_model=HabitTemplateRead)
async def create_habit(
    data: HabitTemplateCreate, user: UserDep, service: HabitServiceDep
):
    return await service.create(user.id, data)


@habit_router.patch("/{habit_id}", response_model=HabitTemplateRead)
async def update_habit(
    habit_id: UUID, data: HabitTemplateUpdate, user: UserDep, service: HabitServiceDep
):
    return await service.update(habit_id, user.id, data)


@habit_router.delete("/{habit_id}")
async def delete_habit(habit_id: UUID, user: UserDep, service: HabitServiceDep):
    await service.delete(habit_id, user.id)
    return {"detail": "Deactivated"}
