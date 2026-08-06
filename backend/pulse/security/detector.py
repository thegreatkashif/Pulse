import statistics
import time
from collections import defaultdict, deque

from pulse.database.db import insert_alert
from pulse.security.schemas import SecurityAlert


class SecurityDetector:
    def __init__(self) -> None:
        self.port_scan_threshold = 15
        self.port_scan_window = 10.0
        self.spike_multiplier = 6.0
        self.spike_min_baseline = 20_000
        self.spike_sustain_samples = 3
        self.spike_cooldown = 30.0

        self._port_hits: dict[str, deque] = defaultdict(lambda: deque(maxlen=200))
        self._known_macs: dict[str, str] = {}
        self._bandwidth_history: deque = deque(maxlen=60)
        self._spike_streak = 0
        self._last_spike_alert = 0.0

        self.on_alert = None

    def configure(
        self,
        port_scan_threshold: int | None = None,
        port_scan_window: float | None = None,
        spike_multiplier: float | None = None,
        spike_min_baseline: int | None = None,
        spike_sustain_samples: int | None = None,
        spike_cooldown: float | None = None,
    ) -> None:
        if port_scan_threshold is not None:
            self.port_scan_threshold = port_scan_threshold
        if port_scan_window is not None:
            self.port_scan_window = port_scan_window
        if spike_multiplier is not None:
            self.spike_multiplier = spike_multiplier
        if spike_min_baseline is not None:
            self.spike_min_baseline = spike_min_baseline
        if spike_sustain_samples is not None:
            self.spike_sustain_samples = spike_sustain_samples
        if spike_cooldown is not None:
            self.spike_cooldown = spike_cooldown

    def _emit(self, severity: str, category: str, message: str) -> None:
        alert = SecurityAlert(timestamp=time.time(), severity=severity, category=category, message=message)
        insert_alert(alert.timestamp, alert.severity, alert.category, alert.message)
        if self.on_alert:
            self.on_alert(alert)

    def observe_packet(self, src_ip: str, dst_port: int | None, direction: str) -> None:
        if direction != "inbound" or dst_port is None:
            return

        now = time.time()
        hits = self._port_hits[src_ip]
        hits.append((now, dst_port))

        recent_ports = {port for ts, port in hits if now - ts <= self.port_scan_window}
        if len(recent_ports) >= self.port_scan_threshold:
            self._emit(
                "critical",
                "port_scan",
                f"{src_ip} probed {len(recent_ports)} distinct ports on this host within "
                f"{self.port_scan_window:.0f}s — signature of a port scan.",
            )
            hits.clear()

    def observe_arp(self, ip: str, mac: str) -> None:
        known = self._known_macs.get(ip)
        if known and known.lower() != mac.lower():
            self._emit(
                "critical",
                "arp_spoof",
                f"{ip} changed MAC address from {known} to {mac}. This could be legitimate "
                "(device reconnected with new NIC/DHCP change) or an ARP spoofing attack "
                "impersonating that device.",
            )
        self._known_macs[ip] = mac

    def observe_bandwidth(self, bytes_in: int, bytes_out: int) -> None:
        total = bytes_in + bytes_out
        self._bandwidth_history.append(total)

        if len(self._bandwidth_history) < 15:
            return

        baseline = statistics.median(self._bandwidth_history)

        if baseline < self.spike_min_baseline or total <= baseline * self.spike_multiplier:
            self._spike_streak = 0
            return

        self._spike_streak += 1

        now = time.time()
        if self._spike_streak >= self.spike_sustain_samples and now - self._last_spike_alert > self.spike_cooldown:
            self._emit(
                "warning",
                "traffic_spike",
                f"Traffic sustained {total / 1024:.0f} KB/s for {self.spike_sustain_samples}+ seconds, "
                f"{total / baseline:.1f}x your recent median ({baseline / 1024:.0f} KB/s).",
            )
            self._last_spike_alert = now
            self._spike_streak = 0


detector = SecurityDetector()