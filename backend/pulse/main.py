import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from pulse.api.router import api_router
from pulse.capture.dns_router import router as dns_router
from pulse.capture.engine import engine
from pulse.capture.router import router as capture_router
from pulse.config.settings import settings
from pulse.database.db import get_recent_alerts, init_db
from pulse.security.detector import detector
from pulse.security.schemas import SecurityAlert
from pulse.topology.service import TopologyEvidence
from pulse.websocket.manager import alert_manager, packet_manager, stats_broadcaster
from pulse.websocket.router import router as websocket_router


def _on_packet(event) -> None:
    asyncio.create_task(packet_manager.broadcast({"type": "packet", **event.model_dump()}))


async def _on_bandwidth(payload: dict) -> None:
    await packet_manager.broadcast({"type": "bandwidth", **payload})


async def _on_topology(evidence: TopologyEvidence) -> None:
    await packet_manager.broadcast({"type": "topology", **evidence.model_dump()})


def _on_alert(alert: SecurityAlert) -> None:
    asyncio.create_task(alert_manager.broadcast({"type": "alert", **alert.model_dump()}))


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()

    engine.on_packet = _on_packet
    engine.on_bandwidth = _on_bandwidth
    engine.on_topology = _on_topology
    detector.on_alert = _on_alert

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
app.include_router(dns_router)
app.include_router(websocket_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "application": settings.app_name,
        "version": settings.version,
        "status": "running",
    }


@app.get("/api/security/alerts", tags=["Security"])
async def security_alerts(limit: int = 100):
    return get_recent_alerts(limit)