import socket

import psutil

from pulse.system.schemas import NetworkOverview


def get_network_overview() -> NetworkOverview:
    stats = psutil.net_if_stats()

    active_interface = None

    for name, stat in stats.items():
        if stat.isup and not name.lower().startswith("loopback"):
            active_interface = name
            break

    internet_connected = False

    try:
        socket.create_connection(("8.8.8.8", 53), timeout=2).close()
        internet_connected = True
    except OSError:
        pass

    return NetworkOverview(
        default_gateway=None,
        active_interface=active_interface,
        internet_connected=internet_connected,
        interface_count=len(stats),
    )