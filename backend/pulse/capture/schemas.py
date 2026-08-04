from typing import Literal
from pydantic import BaseModel


class PacketEvent(BaseModel):
    timestamp: float
    src_ip: str
    dst_ip: str
    src_port: int | None = None
    dst_port: int | None = None
    protocol: str
    length: int
    direction: Literal["inbound", "outbound"]
    summary: str