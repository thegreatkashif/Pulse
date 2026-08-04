from fastapi import APIRouter

from pulse.capture.engine import engine

router = APIRouter(prefix="/api/capture", tags=["Capture"])


@router.post("/start")
async def start_capture():
    engine.start()
    return {"running": engine.running}


@router.post("/stop")
async def stop_capture():
    engine.stop()
    return {"running": engine.running}


@router.get("/status")
async def capture_status():
    return {"running": engine.running}