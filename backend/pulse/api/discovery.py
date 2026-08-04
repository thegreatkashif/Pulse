from fastapi import APIRouter

from pulse.discovery.service import discover_devices, get_local_network

router = APIRouter(tags=["Discovery"])


@router.get("/network")
async def network():
    return {
        "network": get_local_network(),
    }


@router.get("/network/devices")
async def devices():
    return discover_devices()