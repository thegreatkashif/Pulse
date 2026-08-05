from pydantic import BaseModel


class SecurityAlert(BaseModel):
    timestamp: float
    severity: str  # "info" | "warning" | "critical"
    category: str  # "port_scan" | "arp_spoof" | "traffic_spike"
    message: str