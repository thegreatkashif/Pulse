import ipaddress
import socket

from pulse.discovery.schemas import NetworkDevice


def get_local_network() -> str:
    hostname = socket.gethostname()
    ip = socket.gethostbyname(hostname)

    network = ipaddress.ip_network(f"{ip}/24", strict=False)

    return str(network)


def discover_devices() -> list[NetworkDevice]:
    """
    Placeholder discovery engine.

    ARP scanning will be implemented in the next step.
    """

    return []