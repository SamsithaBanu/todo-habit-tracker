from app.schemas.habit_template import HabitTemplateUpdate
from app.schemas.habit_template import HabitTemplateCreate
from fastapi import status
from sqlalchemy import select
from fastapi import HTTPException
from uuid import UUID
from database.models import HABIT_TEMPLATES
from sqlalchemy.ext.asyncio import AsyncSession


class HabitService():
    def __init__(self, session: AsyncSession):
        self.session = session
        self.model = HABIT_TEMPLATES

    async def get_by_id(self, habit_id: UUID, user_id: UUID) -> HABIT_TEMPLATES:
        result = await self.session.execute(
            select(self.model).where(self.model.id == habit_id, self.model.user_id == user_id)
        )
        habit = result.scalar_one_or_none()
        if habit is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Habit template not found")
        return habit

    async def list_by_user(self, user_id: UUID) -> list[HABIT_TEMPLATES]:
        result = await self.session.execute(
            select(self.model).where(self.model.user_id == user_id)
        )
        return list(result.scalars().all())

    async def list_due_today(self, user_id: UUID, weekday: int) -> list[HABIT_TEMPLATES]:
        """weekday: ISO weekday, 1=Mon..7=Sun"""
        result = await self.session.execute(
            select(self.model).where(
                self.model.user_id == user_id,
                self.model.is_active == True,  # noqa: E712
                self.model.repeat_days.any(weekday),
            )
        )
        return list(result.scalars().all())

    async def create(self, user_id: UUID, data: HabitTemplateCreate):
        habit = self.model(
            user_id=user_id,
            title=data.title,
            repeat_days=data.repeat_days,
        )
        self.session.add(habit)
        await self.session.commit()
        await self.session.refresh(habit)
        return habit

    async def update(self, habit_id: UUID, user_id: UUID, data: HabitTemplateUpdate):
        habit = await self.get_by_id(habit_id, user_id)
        if data.title is not None:
            habit.title = data.title
        if data.repeat_days is not None:
            habit.repeat_days = data.repeat_days
        if data.is_active is not None:
            habit.is_active = data.is_active

        await self.session.commit()
        await self.session.refresh(habit)
        return habit

    async def delete(self, habit_id: UUID, user_id: UUID):
        habit = await self.get_by_id(habit_id, user_id)
        habit.is_active = False
        await self.session.commit()