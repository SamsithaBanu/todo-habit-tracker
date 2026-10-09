from app.dependencies import UserDep
from app.schemas.todos import TodoUpdate
from uuid import UUID
from app.schemas.todos import TodoCreate
from app.dependencies import TodoServiceDep
from datetime import date
from app.schemas.todos import TodoRead
from fastapi import APIRouter

todo_router = APIRouter(prefix='/api/todos', tags=['todos'])

@todo_router.get('/', response_model=list[TodoRead])
async def get_all_todos(todo_date:date, user: UserDep, service: TodoServiceDep):
    return await service.list_by_date(user.id, todo_date)

@todo_router.post('/', response_model=TodoRead)
async def create_todo(data:TodoCreate, user: UserDep, service: TodoServiceDep):
    return await service.create(user.id, data)

@todo_router.patch("/{todo_id}", response_model=TodoRead)
async def update_todo(
    todo_id: UUID, data: TodoUpdate, user: UserDep, service: TodoServiceDep
):
    return await service.update(todo_id, user.id, data)

@todo_router.delete("/{todo_id}")
async def delete_todo(todo_id: UUID, user: UserDep, service: TodoServiceDep):
    await service.delete(todo_id, user.id)
    return {"detail": "Deleted"}

@todo_router.patch("/{todo_id}/complete", response_model=TodoRead)
async def complete_todo(todo_id: UUID, user: UserDep, service: TodoServiceDep):
    return await service.mark_complete(todo_id, user.id)


