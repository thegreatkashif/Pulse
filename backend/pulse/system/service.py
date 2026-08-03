from datetime import datetime
import platform
import socket
import time

import psutil

from pulse.system.schemas import (
    CPUInfo,
    MemoryInfo,
    SystemInfo,
    UptimeInfo,
)
from pulse.utils.format import bytes_to_human


def get_system_info() -> SystemInfo:
    memory = psutil.virtual_memory()

    cpu_freq = psutil.cpu_freq()

    boot_time = psutil.boot_time()

    return SystemInfo(
        hostname=socket.gethostname(),
        operating_system=platform.system(),
        platform=platform.platform(),
        architecture=platform.machine(),
        cpu=CPUInfo(
            model=platform.processor(),
            physical_cores=psutil.cpu_count(logical=False) or 0,
            logical_cores=psutil.cpu_count(logical=True) or 0,
            frequency_mhz=cpu_freq.current if cpu_freq else None,
        ),
        memory=MemoryInfo(
            total_bytes=memory.total,
            total_human=bytes_to_human(memory.total),
            available_bytes=memory.available,
            available_human=bytes_to_human(memory.available),
            used_bytes=memory.used,
            used_human=bytes_to_human(memory.used),
            percent=memory.percent,
        ),
        uptime=UptimeInfo(
            boot_time=datetime.fromtimestamp(boot_time).isoformat(),
            uptime_seconds=int(time.time() - boot_time),
        ),
    )