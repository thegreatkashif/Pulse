from fastapi import FastAPI

from pulse.api.root import router
from pulse.config.settings import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Open-source network observability platform",
)

app.include_router(router)