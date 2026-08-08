import ipaddress
import socket

from scapy.all import ARP, Ether, srp

from pulse.discovery.schemas import NetworkDevice
from pulse.security.detector import detector


def get_local_network() -> str:
    from pulse.utils.network import get_local_ip

    ip = get_local_ip()
    network = ipaddress.ip_network(f"{ip}/24", strict=False)

    return str(network)


def discover_devices(timeout: float = 2.0) -> list[NetworkDevice]:
    network = get_local_network()

    packet = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=network)
    answered, _ = srp(packet, timeout=timeout, verbose=False)

    devices = []
    for _, received in answered:
        detector.observe_arp(received.psrc, received.hwsrc)
        devices.append(
            NetworkDevice(
                ip=received.psrc,
                mac=received.hwsrc,
                hostname=_resolve_hostname(received.psrc),
                vendor=None,
                online=True,
            )
        )
    return devices


def _resolve_hostname(ip: str) -> str | None:
    try:
        return socket.gethostbyaddr(ip)[0]
    except (socket.herror, socket.gaierror, OSError):
        return None