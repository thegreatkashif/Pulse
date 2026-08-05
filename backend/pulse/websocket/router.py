from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from pulse.websocket.manager import manager, packet_manager, alert_manager

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


@router.websocket("/ws/alerts")
async def alerts_socket(websocket: WebSocket):
    await alert_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        alert_manager.disconnect(websocket)