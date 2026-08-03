from fastapi import FastAPI

from pulse.api.router import api_router
from pulse.config.settings import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Open-source network observability platform",
)

app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "application": settings.app_name,
        "version": settings.version,
        "status": "running",
    }