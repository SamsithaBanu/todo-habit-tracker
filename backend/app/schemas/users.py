from uuid import UUID
from datetime import datetime, time
from pydantic import BaseModel, EmailStr, Field, field_validator


class BaseUser(BaseModel):
    name: str
    email: EmailStr


class UserCreate(BaseUser):
    password: str = Field(min_length=8)
    pet_species: str          # 'dog' | 'cat' | 'plant', from the signup picker
    pet_nickname: str = Field(min_length=1, max_length=50)
    timezone: str = "UTC"     # browser-detected, sent from frontend at signup

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserRead(BaseUser):
    id: UUID
    is_verified: bool
    timezone: str
    reminder_morning_time: time
    reminder_evening_time: time
    created_at: datetime

    class Config:
        from_attributes = True   # lets you return UserRead.model_validate(user_orm_obj) directly

class UserUpdateSettings(BaseModel):
    # all optional — only send the fields the user actually changed
    reminder_morning_time: time | None = None
    reminder_evening_time: time | None = None
    timezone: str | None = None
