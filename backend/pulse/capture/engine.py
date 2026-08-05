import asyncio
import ipaddress
import socket
import time
from typing import Awaitable, Callable

from scapy.all import AsyncSniffer, Ether, IP, TCP, UDP, getmacbyip

from pulse.capture.schemas import PacketEvent
from pulse.discovery.service import get_local_network
from pulse.system.network import get_default_gateway
from pulse.topology.service import TopologyEvidence, classify_topology
from pulse.capture.dns_logger import extract_dns_query

PROTOCOL_NAMES = {1: "ICMP", 6: "TCP", 17: "UDP"}


class CaptureEngine:
    def __init__(self) -> None:
        self.sniffer: AsyncSniffer | None = None
        self.running: bool = False
        self.host_ip: str | None = None
        self.local_subnet: ipaddress.IPv4Network | None = None
        self.gateway_ip: str | None = None
        self.gateway_mac: str | None = None
        self.loop: asyncio.AbstractEventLoop | None = None

        self.on_packet: Callable[[PacketEvent], None] | None = None
        self.on_bandwidth: Callable[[dict], Awaitable[None]] | None = None
        self.on_topology: Callable[[TopologyEvidence], Awaitable[None]] | None = None

        self._bytes_in = 0
        self._bytes_out = 0
        self._local_direct_frames = 0
        self._gateway_relayed_frames = 0
        self._bandwidth_task: asyncio.Task | None = None

    def start(self) -> None:
        if self.running:
            return

        self.host_ip = socket.gethostbyname(socket.gethostname())
        self.local_subnet = ipaddress.ip_network(get_local_network(), strict=False)
        self.gateway_ip = get_default_gateway()
        self.gateway_mac = getmacbyip(self.gateway_ip) if self.gateway_ip else None
        self.loop = asyncio.get_event_loop()

        print(f"[capture] started, gateway_ip={self.gateway_ip}, gateway_mac={self.gateway_mac}")

        self.sniffer = AsyncSniffer(
            filter=f"ip and (src host {self.host_ip} or dst host {self.host_ip})",
            prn=self._handle_packet,
            store=False,
        )
        self.sniffer.start()
        self.running = True
        self._bandwidth_task = asyncio.create_task(self._bandwidth_loop())

    def stop(self) -> None:
        if not self.running:
            return
        if self.sniffer:
            self.sniffer.stop()
        if self._bandwidth_task:
            self._bandwidth_task.cancel()
        self.running = False
        self._local_direct_frames = 0
        self._gateway_relayed_frames = 0

    def _handle_packet(self, packet) -> None:
        if IP not in packet:
            return
        
        extract_dns_query(packet)

        ip_layer = packet[IP]
        length = len(packet)
        direction = "outbound" if ip_layer.src == self.host_ip else "inbound"

        if direction == "outbound":
            self._bytes_out += length
            self._track_topology_evidence(packet, ip_layer.dst)
        else:
            self._bytes_in += length

        protocol = PROTOCOL_NAMES.get(ip_layer.proto, str(ip_layer.proto))

        src_port = dst_port = None
        if TCP in packet:
            src_port, dst_port = packet[TCP].sport, packet[TCP].dport
        elif UDP in packet:
            src_port, dst_port = packet[UDP].sport, packet[UDP].dport

        event = PacketEvent(
            timestamp=time.time(),
            src_ip=ip_layer.src,
            dst_ip=ip_layer.dst,
            src_port=src_port,
            dst_port=dst_port,
            protocol=protocol,
            length=length,
            direction=direction,
            summary=f"{protocol} {ip_layer.src}:{src_port or '-'} -> {ip_layer.dst}:{dst_port or '-'} ({length}B)",
        )

        if self.on_packet and self.loop:
            self.loop.call_soon_threadsafe(self.on_packet, event)

    def _track_topology_evidence(self, packet, dst_ip: str) -> None:
        """Uses the real destination MAC of each outbound frame as evidence,
        not a guess. If dst is outside our subnet and the frame's MAC is the
        gateway's, that's direct proof of hub-and-spoke routing.
        """
        if Ether not in packet or self.local_subnet is None or not self.gateway_mac:
            return

        dst_mac = packet[Ether].dst
        is_local = ipaddress.ip_address(dst_ip) in self.local_subnet

        if is_local and dst_mac.lower() != self.gateway_mac.lower():
            self._local_direct_frames += 1
        elif not is_local and dst_mac.lower() == self.gateway_mac.lower():
            self._gateway_relayed_frames += 1

    async def _bandwidth_loop(self, interval: float = 1.0) -> None:
        while True:
            await asyncio.sleep(interval)

            try:
                if self.on_bandwidth:
                    await self.on_bandwidth(
                        {"bytes_in": self._bytes_in, "bytes_out": self._bytes_out, "timestamp": time.time()}
                    )
                self._bytes_in = 0
                self._bytes_out = 0

                if self.on_topology:
                    evidence = classify_topology(
                        gateway_ip=self.gateway_ip,
                        gateway_mac=self.gateway_mac,
                        local_direct_frames=self._local_direct_frames,
                        gateway_relayed_frames=self._gateway_relayed_frames,
                    )
                    await self.on_topology(evidence)
            except Exception:
                import traceback
                print("=== _bandwidth_loop error ===")
                traceback.print_exc()


engine = CaptureEngine()