import statistics
import time
from collections import defaultdict, deque

from pulse.database.db import insert_alert
from pulse.security.schemas import SecurityAlert

PORT_SCAN_THRESHOLD = 15
PORT_SCAN_WINDOW = 10.0

SPIKE_MULTIPLIER = 6.0
SPIKE_MIN_BASELINE = 20_000       # ignore spikes below a 20 KB/s baseline — too small to matter
SPIKE_SUSTAIN_SAMPLES = 3         # must stay above threshold for 3 consecutive 1s samples
SPIKE_COOLDOWN = 30.0             # don't re-alert on the same ongoing spike for 30s


class SecurityDetector:
    def __init__(self) -> None:
        self._port_hits: dict[str, deque] = defaultdict(lambda: deque(maxlen=200))
        self._known_macs: dict[str, str] = {}
        self._bandwidth_history: deque = deque(maxlen=60)
        self._spike_streak = 0
        self._last_spike_alert = 0.0

        self.on_alert = None

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

        recent_ports = {port for ts, port in hits if now - ts <= PORT_SCAN_WINDOW}
        if len(recent_ports) >= PORT_SCAN_THRESHOLD:
            self._emit(
                "critical",
                "port_scan",
                f"{src_ip} probed {len(recent_ports)} distinct ports on this host within "
                f"{PORT_SCAN_WINDOW:.0f}s — signature of a port scan.",
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

        # Need real history before we can judge what's "normal"
        if len(self._bandwidth_history) < 15:
            return

        # Median resists being dragged up by the very bursts we're trying to detect
        baseline = statistics.median(self._bandwidth_history)

        if baseline < SPIKE_MIN_BASELINE or total <= baseline * SPIKE_MULTIPLIER:
            self._spike_streak = 0
            return

        self._spike_streak += 1

        now = time.time()
        if self._spike_streak >= SPIKE_SUSTAIN_SAMPLES and now - self._last_spike_alert > SPIKE_COOLDOWN:
            self._emit(
                "warning",
                "traffic_spike",
                f"Traffic sustained {total / 1024:.0f} KB/s for {SPIKE_SUSTAIN_SAMPLES}+ seconds, "
                f"{total / baseline:.1f}x your recent median ({baseline / 1024:.0f} KB/s).",
            )
            self._last_spike_alert = now
            self._spike_streak = 0


detector = SecurityDetector()