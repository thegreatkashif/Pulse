import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from pulse.api.router import api_router
from pulse.capture.engine import engine
from pulse.capture.router import router as capture_router
from pulse.config.settings import settings
from pulse.topology.service import TopologyEvidence
from pulse.websocket.manager import stats_broadcaster, packet_manager
from pulse.websocket.router import router as websocket_router


def _on_packet(event) -> None:
    asyncio.create_task(packet_manager.broadcast({"type": "packet", **event.model_dump()}))


async def _on_bandwidth(payload: dict) -> None:
    await packet_manager.broadcast({"type": "bandwidth", **payload})


async def _on_topology(evidence: TopologyEvidence) -> None:
    await packet_manager.broadcast({"type": "topology", **evidence.model_dump()})


@asynccontextmanager
async def lifespan(app: FastAPI):
    engine.on_packet = _on_packet
    engine.on_bandwidth = _on_bandwidth
    engine.on_topology = _on_topology

    task = asyncio.create_task(stats_broadcaster())
    yield
    task.cancel()
    engine.stop()


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Open-source network observability platform",
    lifespan=lifespan,
)

app.include_router(api_router)
app.include_router(capture_router)
app.include_router(websocket_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "application": settings.app_name,
        "version": settings.version,
        "status": "running",
    }