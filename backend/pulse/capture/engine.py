import asyncio
import socket
import time
from typing import Awaitable, Callable

from scapy.all import AsyncSniffer, IP, TCP, UDP

from pulse.capture.schemas import PacketEvent

PROTOCOL_NAMES = {1: "ICMP", 6: "TCP", 17: "UDP"}


class CaptureEngine:
    def __init__(self) -> None:
        self.sniffer: AsyncSniffer | None = None
        self.running: bool = False
        self.host_ip: str | None = None
        self.loop: asyncio.AbstractEventLoop | None = None

        self.on_packet: Callable[[PacketEvent], None] | None = None
        self.on_bandwidth: Callable[[dict], Awaitable[None]] | None = None

        self._bytes_in = 0
        self._bytes_out = 0
        self._bandwidth_task: asyncio.Task | None = None

    def start(self) -> None:
        if self.running:
            return

        self.host_ip = socket.gethostbyname(socket.gethostname())
        self.loop = asyncio.get_event_loop()

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

    def _handle_packet(self, packet) -> None:
        if IP not in packet:
            return

        ip_layer = packet[IP]
        length = len(packet)
        direction = "outbound" if ip_layer.src == self.host_ip else "inbound"

        if direction == "outbound":
            self._bytes_out += length
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

    async def _bandwidth_loop(self, interval: float = 1.0) -> None:
        while True:
            await asyncio.sleep(interval)
            if self.on_bandwidth:
                await self.on_bandwidth(
                    {"bytes_in": self._bytes_in, "bytes_out": self._bytes_out, "timestamp": time.time()}
                )
            self._bytes_in = 0
            self._bytes_out = 0


engine = CaptureEngine()