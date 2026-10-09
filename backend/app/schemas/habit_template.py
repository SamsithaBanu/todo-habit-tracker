from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class HabitTemplateCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    repeat_days: list[int]

    @field_validator("repeat_days")
    @classmethod
    def validate_days(cls, v: list[int]) -> list[int]:
        if not v:
            raise ValueError("repeat_days cannot be empty")
        if any(d < 1 or d > 7 for d in v):
            raise ValueError("repeat_days must be between 1 (Mon) and 7 (Sun)")
        return sorted(set(v))


class HabitTemplateUpdate(BaseModel):
    title: str | None = None
    repeat_days: list[int] | None = None
    is_active: bool | None = None


class HabitTemplateRead(BaseModel):
    id: UUID
    title: str
    repeat_days: list[int]
    is_active: bool
