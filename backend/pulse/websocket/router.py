from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from pulse.websocket.manager import manager, packet_manager

router = APIRouter()


@router.websocket("/ws/stats")
async def stats_socket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.websocket("/ws/packets")
async def packets_socket(websocket: WebSocket):
    await packet_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        packet_manager.disconnect(websocket)