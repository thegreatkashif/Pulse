from fastapi import APIRouter

from pulse.system.service import get_system_info

router = APIRouter(tags=["System"])


@router.get("/system")
async def system():
    return get_system_info()