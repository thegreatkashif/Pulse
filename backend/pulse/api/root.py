from fastapi import APIRouter

from pulse.config.settings import settings

router = APIRouter()


@router.get("/", tags=["Root"])
async def root():
    return {
        "application": settings.app_name,
        "version": settings.version,
        "status": "running",
        "message": "Welcome to Pulse",
    }


@router.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
    }