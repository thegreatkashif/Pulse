from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from pulse.discovery.service import discover_devices, get_local_network

router = APIRouter(tags=["Discovery"])


@router.get("/network")
async def network():
    return {
        "network": get_local_network(),
    }


@router.get("/network/devices")
async def devices():
    return await run_in_threadpool(discover_devices)