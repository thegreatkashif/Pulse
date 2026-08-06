from pydantic import BaseModel


class CPUInfo(BaseModel):
    model: str
    physical_cores: int
    logical_cores: int
    frequency_mhz: float | None


class MemoryInfo(BaseModel):
    total_bytes: int
    total_human: str

    available_bytes: int
    available_human: str

    used_bytes: int
    used_human: str

    percent: float


class DiskInfo(BaseModel):
    total_bytes: int
    total_human: str

    used_bytes: int
    used_human: str

    free_bytes: int
    free_human: str

    percent: float


class TemperatureInfo(BaseModel):
    available: bool
    celsius: float | None
    label: str | None
    note: str


class UptimeInfo(BaseModel):
    boot_time: str
    uptime_seconds: int


class NetworkInterface(BaseModel):
    name: str
    is_up: bool
    mtu: int
    speed_mbps: int
    mac: str | None
    ipv4: list[str]
    ipv6: list[str]


class SystemInfo(BaseModel):
    hostname: str
    operating_system: str
    platform: str
    architecture: str

    cpu: CPUInfo
    memory: MemoryInfo
    disk: DiskInfo
    temperature: TemperatureInfo
    uptime: UptimeInfo


class NetworkOverview(BaseModel):
    default_gateway: str | None
    active_interface: str | None
    internet_connected: bool
    interface_count: int