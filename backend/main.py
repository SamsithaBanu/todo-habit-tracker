from jobs.schedular import scheduler
from jobs.schedular import start_scheduler
from app.router import master_router
from database.session import create_db_tables
from contextlib import asynccontextmanager
from scalar_fastapi import get_scalar_api_reference
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    await create_db_tables()
    start_scheduler()
    yield
    scheduler.shutdown()


app = FastAPI(
    lifespan=lifespan_handler
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://.*",
    allow_headers=['*'],
    allow_methods=['*'],
    allow_credentials=True
)

@app.get('/scalar', include_in_schema=False)
def get_scalar():
    return get_scalar_api_reference(
        openapi_url = app.openapi_url,
        title='Scalar Api'
    )

app.include_router(master_router)
