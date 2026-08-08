from pulse.topology.service import classify_topology


def test_unknown_when_no_gateway():
    result = classify_topology(gateway_ip=None, gateway_mac=None, local_direct_frames=0, gateway_relayed_frames=0)
    assert result.classification == "unknown"


def test_insufficient_data_before_any_relayed_traffic():
    result = classify_topology(
        gateway_ip="192.168.1.1",
        gateway_mac="aa:bb:cc:dd:ee:ff",
        local_direct_frames=0,
        gateway_relayed_frames=0,
    )
    assert result.classification == "insufficient-data"


def test_star_classification_after_relayed_evidence():
    result = classify_topology(
        gateway_ip="192.168.1.1",
        gateway_mac="aa:bb:cc:dd:ee:ff",
        local_direct_frames=0,
        gateway_relayed_frames=5,
    )
    assert result.classification == "star (hub-and-spoke)"
    assert "5 outbound frame(s)" in result.explanation


def test_explanation_mentions_local_direct_frames_when_present():
    result = classify_topology(
        gateway_ip="192.168.1.1",
        gateway_mac="aa:bb:cc:dd:ee:ff",
        local_direct_frames=3,
        gateway_relayed_frames=5,
    )
    assert "3 frame(s)" in result.explanation
    assert "switched LAN" in result.explanation