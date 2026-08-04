from fastapi import APIRouter

from pulse.api.health import router as health_router
from pulse.api.system import router as system_router
from pulse.api.discovery import router as discovery_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(system_router)
api_router.include_router(discovery_router)