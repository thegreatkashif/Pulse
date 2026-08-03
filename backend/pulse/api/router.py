from fastapi import APIRouter

from pulse.api.v1.health import router as health_router
from pulse.api.v1.system import router as system_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(system_router)