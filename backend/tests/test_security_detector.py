import time

from pulse.security.detector import SecurityDetector


def test_no_alert_below_port_scan_threshold():
    detector = SecurityDetector()
    detector.configure(port_scan_threshold=15, port_scan_window=10.0)
    alerts = []
    detector.on_alert = alerts.append

    for port in range(10):
        detector.observe_packet("10.0.0.5", port, "inbound")

    assert alerts == []


def test_alert_fires_at_port_scan_threshold():
    detector = SecurityDetector()
    detector.configure(port_scan_threshold=15, port_scan_window=10.0)
    alerts = []
    detector.on_alert = alerts.append

    for port in range(20):
        detector.observe_packet("10.0.0.5", port, "inbound")

    assert len(alerts) == 1
    assert alerts[0].category == "port_scan"
    assert alerts[0].severity == "critical"


def test_outbound_packets_never_trigger_port_scan():
    detector = SecurityDetector()
    detector.configure(port_scan_threshold=5, port_scan_window=10.0)
    alerts = []
    detector.on_alert = alerts.append

    for port in range(20):
        detector.observe_packet("10.0.0.5", port, "outbound")

    assert alerts == []


def test_arp_spoof_detected_on_mac_change():
    detector = SecurityDetector()
    alerts = []
    detector.on_alert = alerts.append

    detector.observe_arp("192.168.1.50", "aa:aa:aa:aa:aa:aa")
    assert alerts == []  # first sighting, nothing to compare against

    detector.observe_arp("192.168.1.50", "bb:bb:bb:bb:bb:bb")
    assert len(alerts) == 1
    assert alerts[0].category == "arp_spoof"


def test_arp_no_alert_when_mac_unchanged():
    detector = SecurityDetector()
    alerts = []
    detector.on_alert = alerts.append

    detector.observe_arp("192.168.1.50", "aa:aa:aa:aa:aa:aa")
    detector.observe_arp("192.168.1.50", "aa:aa:aa:aa:aa:aa")

    assert alerts == []


def test_traffic_spike_requires_sustained_samples():
    detector = SecurityDetector()
    detector.configure(spike_multiplier=4.0, spike_min_baseline=1000, spike_sustain_samples=3, spike_cooldown=30.0)
    alerts = []
    detector.on_alert = alerts.append

    # Establish a quiet baseline
    for _ in range(15):
        detector.observe_bandwidth(2000, 2000)

    # One spike sample alone should not fire
    detector.observe_bandwidth(50_000, 0)
    assert alerts == []

    # But 3 consecutive spike samples should
    detector.observe_bandwidth(50_000, 0)
    detector.observe_bandwidth(50_000, 0)
    assert len(alerts) == 1
    assert alerts[0].category == "traffic_spike"


def test_traffic_spike_respects_cooldown():
    detector = SecurityDetector()
    detector.configure(spike_multiplier=4.0, spike_min_baseline=1000, spike_sustain_samples=1, spike_cooldown=9999)
    alerts = []
    detector.on_alert = alerts.append

    for _ in range(15):
        detector.observe_bandwidth(2000, 2000)

    detector.observe_bandwidth(50_000, 0)
    detector.observe_bandwidth(50_000, 0)  # would fire again without cooldown

    assert len(alerts) == 1  # cooldown suppressed the second one