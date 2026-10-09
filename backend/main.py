from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import get_scalar_api_reference

from jobs.schedular import scheduler, start_scheduler
from app.router import master_router
from database.session import create_db_tables

@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    await create_db_tables()
    start_scheduler()
    try:
        yield
    finally:
        if scheduler.running:
            scheduler.shutdown(wait=False)

app = FastAPI(lifespan=lifespan_handler)

origins = [
"http://localhost:5173",
"http://127.0.0.1:5173",
"http://localhost:3000",
"https://todo-habit-tracker-seven.vercel.app",
]

app.add_middleware(
CORSMiddleware,
allow_origins=origins,
allow_headers=["*"],
allow_methods=["*"],
allow_credentials=True,
)

@app.get("/scalar", include_in_schema=False)
def get_scalar():
    return get_scalar_api_reference(
    openapi_url=app.openapi_url,
    title="Scalar API",
    )

app.include_router(master_router)
