from datetime import datetime
from app.schemas.todos import TodoUpdate
from app.schemas.todos import TodoCreate
from datetime import date, timezone as tz
from fastapi import status
from fastapi import HTTPException
from uuid import UUID
from database.models import TODOS
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

class TodoService():
    def __init__(self, session: AsyncSession):
        self.model = TODOS
        self.session = session
    
    async def _get_owned(self, todo_id:UUID, user_id: UUID) -> TODOS:
        todo = await self.session.get(self.model, todo_id)
        if todo is None or todo.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Todo not found")
        return todo

    async def list_by_date(self, user_id:UUID, todo_date:date)->list[TODOS]:
        result = await self.session.execute(
            select(self.model).where(self.model.user_id == user_id, self.model.todo_date == todo_date)
        )
        return result.scalars().all()
    
    async def _already_generated(self, user_id:UUID, habit_id:UUID, todo_date:date) -> bool:
        result = await self.session.execute(
            select(self.model).where(
                self.model.user_id == user_id,
                self.model.habit_template_id == habit_id,
                self.model.todo_date == todo_date,
            )
        )
        return result.scalar_one_or_none() is not None

    async def create(self, user_id:UUID, data: TodoCreate) ->TODOS:
        todo = self.model(
            user_id=user_id,
            title=data.title,
            todo_date=data.todo_date
        )
        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo
    
    async def update(self, todo_id:UUID, user_id: UUID, data:TodoUpdate) ->TODOS:
        todo = await self._get_owned(todo_id, user_id)
        if todo.status != 'pending':
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Cannot edit a completed todo")
        todo.title = data.title
        await self.session.commit()
        await self.session.refresh(todo)
        return todo 
    
    async def delete(self, todo_id: UUID, user_id: UUID) ->None:
        todo = await self._get_owned(todo_id, user_id)
        if todo.status != 'pending':
            raise HTTPException(status.HTTP_403_FORBIDDEN, 'Cannot delete a completed todo')
        await self.session.delete(todo)
        await self.session.commit()

    async def mark_complete(self, todo_id: UUID, user_id: UUID) -> TODOS:
        todo = await self._get_owned(todo_id, user_id)
        if todo.status == "completed":
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Todo already completed")
        todo.status = "completed"
        todo.completed_at = datetime.now(tz.utc)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo