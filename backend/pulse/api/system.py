from fastapi import APIRouter

from pulse.system.interfaces import get_network_interfaces
from pulse.system.service import get_system_info
from pulse.system.network import get_network_overview

router = APIRouter(tags=["System"])


@router.get("/system")
async def system():
    return get_system_info()


@router.get("/system/interfaces")
async def system_interfaces():
    return get_network_interfaces()

@router.get("/system/network")
async def system_network():
    return get_network_overview()