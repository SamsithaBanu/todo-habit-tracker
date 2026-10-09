from config import db_settings
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlmodel import SQLModel

engine = create_async_engine(
    url=db_settings.DATABASE_URL,
    echo=True
)

# built once, reused everywhere — this is what the scheduler will import
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def create_db_tables():
    async with engine.begin() as conn:
        from database.models import USERSS, PETS, HABIT_TEMPLATES, TODOS
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session():
    async with async_session_maker() as session:
        yield session