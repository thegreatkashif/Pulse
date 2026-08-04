from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from pulse.websocket.manager import manager

router = APIRouter()


@router.websocket("/ws/stats")
async def stats_socket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)