from datetime import datetime, date
from uuid import UUID
from pydantic import Field, BaseModel


class TodoCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    todo_date: date


class TodoUpdate(BaseModel):
    title: str = Field(min_length=3, max_length=200)


class TodoRead(BaseModel):
    id: UUID
    title: str
    todo_date: date
    status: str
    completed_at: datetime | None
    habit_template_id: UUID | None

    class Config:
        from_attributes = True
