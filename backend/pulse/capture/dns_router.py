from fastapi import APIRouter

from pulse.database.db import get_recent_dns

router = APIRouter(prefix="/api/dns", tags=["DNS"])


@router.get("/recent")
async def recent_dns(limit: int = 100):
    return get_recent_dns(limit)