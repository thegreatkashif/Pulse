import asyncio
import json

from fastapi import WebSocket

from pulse.system.service import get_system_info
from pulse.system.network import get_network_overview


class ConnectionManager:
    def __init__(self) -> None:
        self.active: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, message: dict) -> None:
        payload = json.dumps(message)
        stale = []

        for connection in self.active:
            try:
                await connection.send_text(payload)
            except Exception:
                stale.append(connection)

        for connection in stale:
            self.disconnect(connection)


manager = ConnectionManager()


async def stats_broadcaster(interval: float = 3.0) -> None:
    while True:
        system = get_system_info()
        network = get_network_overview()

        await manager.broadcast(
            {
                "type": "stats",
                "system": system.model_dump(),
                "network": network.model_dump(),
            }
        )

        await asyncio.sleep(interval)