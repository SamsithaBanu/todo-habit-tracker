from database.models import TODOS
from datetime import timedelta
from app.schemas.pets import PetAdoptRequest
from datetime import datetime, timezone as tz
from fastapi import status
from fastapi import HTTPException
from sqlalchemy import select
from uuid import UUID
from database.models import PETS
from sqlalchemy.ext.asyncio import AsyncSession

class PetService:
    def __init__(self, session: AsyncSession):
        self.model = PETS
        self.session = session 
    
    async def get_by_user(self, user_id: UUID) -> PETS:
        pet = await self.session.scalar(
            select(self.model).where(self.model.user_id == user_id)
        )
        if pet is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, 'No pet found for this user')
        return pet

    async def get_pet_status(self, user_id: UUID) -> dict:
        """Used by GET /pets/me — adds can_revive without changing the base pet fetch."""
        pet = await self.get_by_user(user_id)
        can_revive = False
        if pet.status == "dead":
            can_revive = await self._has_7_day_perfect_streak(user_id)
        return {"pet": pet, "can_revive": can_revive}

    async def apply_health_delta(self, user_id:UUID, delta: int) -> PETS:
        """Called by the nightly feed job. Clamps health between 0-100 and kills the pet at 0."""
        pet = await self.get_by_user(user_id)
        if pet.status == "dead":
            return pet
        
        new_health = max(0, min(100, pet.health + delta))
        pet.health = new_health
        if new_health == 0:
            pet.status = "dead"
            pet.died_at= datetime.now(tz.utc)

        self.session.add(pet)
        await self.session.commit()
        await self.session.refresh(pet)
        return pet
    
    async def revive(self, user_id: UUID) -> PETS:
        pet = await self.get_by_user(user_id)
        if pet.status != "dead":
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Pet is not dead")
        
        if not await self._has_7_day_perfect_streak(user_id):
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Complete 100% of your todos for 7 days in row to revive your pet."
            )
        pet.status = "alive"
        pet.health = 50
        pet.died_at= None

        self.session.add(pet)
        await self.session.commit()
        await self.session.refresh(pet)

        return pet
    
    async def adopt(self, user_id: UUID, data: PetAdoptRequest) -> PETS:
        pet = await self.get_by_user(user_id)
        if pet.status != "dead":
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current pet is still alive")
        pet.species = data.species
        pet.nickname = data.nickname
        pet.status="alive"
        pet.health = 70
        pet.died_at= None

        self.session.add(pet)
        await self.session.commit()
        await self.session.refresh(pet)
        return pet

    async def get_streak_days(self, user_id: UUID) -> list[bool]:
        """Returns 7 booleans, oldest to newest, for the last 7 completed days."""
        end = datetime.now(tz.utc).date() - timedelta(days=1)
        start = end - timedelta(days=6)

        result = await self.session.execute(
            select(TODOS.todo_date, TODOS.status).where(
                TODOS.user_id == user_id,
                TODOS.todo_date.between(start, end),
            )
        )
        rows = result.all()

        by_date: dict = {}
        for todo_date, status_ in rows:
            by_date.setdefault(todo_date, []).append(status_)

        days = []
        for i in range(7):
            d = start + timedelta(days=i)
            statuses = by_date.get(d, [])
            days.append(bool(statuses) and all(s == "completed" for s in statuses))
        return days

    async def _has_7_day_perfect_streak(self, user_id: UUID) -> bool:
        streak_days = await self.get_streak_days(user_id)
        return all(streak_days)
    
    async def get_pet_with_revive_status(self, user_id: UUID) -> dict:
        pet = await self.get_by_user(user_id)
        streak_days = [False] * 7
        can_revive = False

        if pet.status == "dead":
            streak_days = await self.get_streak_days(user_id)
            can_revive = all(streak_days)

        return {"pet": pet, "can_revive": can_revive, "streak_days": streak_days}