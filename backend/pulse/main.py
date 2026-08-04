import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from pulse.api.router import api_router
from pulse.config.settings import settings
from pulse.websocket.manager import stats_broadcaster
from pulse.websocket.router import router as websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(stats_broadcaster())
    yield
    task.cancel()


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Open-source network observability platform",
    lifespan=lifespan,
)

app.include_router(api_router)
app.include_router(websocket_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "application": settings.app_name,
        "version": settings.version,
        "status": "running",
    }