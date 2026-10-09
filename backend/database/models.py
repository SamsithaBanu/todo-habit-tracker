from sqlalchemy import table
from sqlalchemy import ARRAY, Numeric
from sqlalchemy import UniqueConstraint
from uuid import UUID, uuid4
from datetime import datetime, time, date
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, Text, Boolean, DateTime, Time, func, Integer, ForeignKey, Date
from pydantic import EmailStr

class USERSS(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(sa_column=Column(Text, nullable=False))
    password_hash: str = Field(sa_column=Column(Text, nullable=False))
    email: EmailStr = Field(sa_column=Column(String(255), unique=True, nullable=False))
    created_at: datetime | None = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), nullable=False))
    updated_at: datetime | None = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False))
    timezone: str = Field(default="UTC", sa_column=Column(Text, nullable=False))
    is_verified: bool = Field(default=False, sa_column=Column(Boolean, default=False, nullable=False))
    reminder_morning_time: time = Field(default=time(8, 0), sa_column=Column(Time, nullable=False))
    reminder_evening_time: time = Field(default=time(21, 0), sa_column=Column(Time, nullable=False))

class PETS(SQLModel, table=True):
    __tablename__ = "pets"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True))
    species: str = Field(sa_column=Column(Text, nullable=False))       # 'dog', 'cat', 'rose', etc.
    nickname: str | None = Field(default=None, sa_column=Column(Text))  # the pet's name
    health: int = Field(default=70, sa_column=Column(Integer, nullable=False))
    status: str = Field(default="alive", sa_column=Column(Text, nullable=False))  # 'alive' | 'dead'
    born_at: datetime | None = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))
    died_at: datetime | None = Field(default=None, sa_column=Column(DateTime(timezone=True)))

class TODOS(SQLModel, table=True):
    __tablename__ = "todos"
    __table_args__ = (
        UniqueConstraint("user_id", "habit_template_id", "todo_date", name="uq_todo_per_day"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
    habit_template_id: UUID | None = Field(
        default=None, sa_column=Column(ForeignKey("habit_templates.id", ondelete="SET NULL"), nullable=True)
    )
    title: str = Field(sa_column=Column(Text, nullable=False))
    todo_date: date = Field(sa_column=Column(Date, nullable=False))
    status: str = Field(default="pending", sa_column=Column(Text, nullable=False))  # 'pending' | 'completed'
    completed_at: datetime | None = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    created_at: datetime | None = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))

class HABIT_TEMPLATES(SQLModel, table=True):
    __tablename__ = "habit_templates"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
    title: str = Field(sa_column=Column(Text, nullable=False))
    repeat_days: list[int] = Field(sa_column=Column(ARRAY(Integer), nullable=False))  # 1=Mon .. 7=Sun
    is_active: bool = Field(default=True, sa_column=Column(Boolean, default=True, nullable=False))
    created_at: datetime | None = Field(sa_column=Column(DateTime(timezone=True), server_default=func.now()))

class DAILY_SUMMARIES(SQLModel, table=True):
    __tablename__ = "daily_summaries"
    __table_args__ = (UniqueConstraint("user_id", "summary_date", name="uq_summary_per_day"),)

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
    summary_date: date = Field(sa_column=Column(Date, nullable=False))
    total_todos: int = Field(sa_column=Column(Integer, nullable=False))
    completed_todos: int = Field(sa_column=Column(Integer, nullable=False))
    completion_pct: float = Field(sa_column=Column(Numeric(5, 2), nullable=False))
    feed_level: str = Field(sa_column=Column(Text, nullable=False))
    health_delta: int = Field(sa_column=Column(Integer, nullable=False))

class PUSH_SUBSCRIPTIONS(SQLModel, table=True):
    __tablename__ = "push_subscriptions"
    __table_args__ = (UniqueConstraint("endpoint", name="uq_push_endpoint"),)

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(sa_column=Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
    endpoint: str = Field(sa_column=Column(Text, nullable=False))
    p256dh: str = Field(sa_column=Column(Text, nullable=False))
    auth: str = Field(sa_column=Column(Text, nullable=False))