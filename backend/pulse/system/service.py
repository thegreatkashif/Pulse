from datetime import datetime
import platform
import socket
import time

import psutil

from pulse.system.schemas import (
    CPUInfo,
    DiskInfo,
    MemoryInfo,
    SystemInfo,
    TemperatureInfo,
    UptimeInfo,
)
from pulse.utils.format import bytes_to_human


def _get_disk_info() -> DiskInfo:
    # "/" resolves correctly on Linux/macOS; psutil maps it to "C:\" on Windows automatically
    usage = psutil.disk_usage("/")

    return DiskInfo(
        total_bytes=usage.total,
        total_human=bytes_to_human(usage.total),
        used_bytes=usage.used,
        used_human=bytes_to_human(usage.used),
        free_bytes=usage.free,
        free_human=bytes_to_human(usage.free),
        percent=usage.percent,
    )


def _get_temperature_info() -> TemperatureInfo:
    # psutil.sensors_temperatures() only exists on Linux, and even there many
    # systems don't expose it. There is no equivalent on Windows without
    # extra third-party tooling (e.g. OpenHardwareMonitor), so we report
    # honestly rather than fabricate a number.
    getter = getattr(psutil, "sensors_temperatures", None)

    if getter is None:
        return TemperatureInfo(
            available=False,
            celsius=None,
            label=None,
            note=f"Temperature sensors are not accessible on {platform.system()} without additional tooling.",
        )

    try:
        readings = getter()
    except Exception:
        readings = {}

    if not readings:
        return TemperatureInfo(
            available=False,
            celsius=None,
            label=None,
            note="No temperature sensors were found on this system.",
        )

    # Grab the first available sensor reading as a representative value
    for label, entries in readings.items():
        if entries:
            entry = entries[0]
            return TemperatureInfo(
                available=True,
                celsius=entry.current,
                label=entry.label or label,
                note="Live sensor reading.",
            )

    return TemperatureInfo(
        available=False,
        celsius=None,
        label=None,
        note="Temperature sensors reported no readings.",
    )


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
        disk=_get_disk_info(),
        temperature=_get_temperature_info(),
        uptime=UptimeInfo(
            boot_time=datetime.fromtimestamp(boot_time).isoformat(),
            uptime_seconds=int(time.time() - boot_time),
        ),
    )