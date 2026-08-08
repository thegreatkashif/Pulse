import psutil
import socket

from pulse.system.schemas import NetworkInterface


def get_network_interfaces() -> list[NetworkInterface]:
    interfaces = []

    stats = psutil.net_if_stats()
    addresses = psutil.net_if_addrs()

    for name, addrs in addresses.items():
        ipv4 = []
        ipv6 = []
        mac = None

        for addr in addrs:
            # Windows/Linux IPv4
            if addr.family == socket.AF_INET:
                ipv4.append(addr.address)

            # Windows/Linux IPv6
            elif addr.family == socket.AF_INET6:
                ipv6.append(addr.address.split("%")[0])

            # MAC Address
            else:
                if addr.address and len(addr.address) >= 17:
                    mac = addr.address

        stat = stats.get(name)

        interfaces.append(
            NetworkInterface(
                name=name,
                is_up=stat.isup if stat else False,
                mtu=stat.mtu if stat else 0,
                speed_mbps=stat.speed if stat else 0,
                mac=mac,
                ipv4=ipv4,
                ipv6=ipv6,
            )
        )

    return interfaces