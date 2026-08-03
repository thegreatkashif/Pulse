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


class UptimeInfo(BaseModel):
    boot_time: str
    uptime_seconds: int


class SystemInfo(BaseModel):
    hostname: str
    operating_system: str
    platform: str
    architecture: str

    cpu: CPUInfo
    memory: MemoryInfo
    uptime: UptimeInfo