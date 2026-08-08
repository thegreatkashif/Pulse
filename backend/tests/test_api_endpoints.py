from fastapi.testclient import TestClient

from pulse.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200


def test_system_info_shape():
    response = client.get("/api/system")
    assert response.status_code == 200
    data = response.json()
    assert "cpu" in data
    assert "memory" in data
    assert "disk" in data
    assert "temperature" in data
    assert "uptime" in data


def test_capture_status_initially_not_running():
    response = client.get("/api/capture/status")
    assert response.status_code == 200
    assert response.json()["running"] is False


def test_security_alerts_empty_initially():
    response = client.get("/api/security/alerts")
    assert response.status_code == 200
    assert response.json() == []


def test_dns_recent_empty_initially():
    response = client.get("/api/dns/recent")
    assert response.status_code == 200
    assert response.json() == []


def test_capture_preferences_round_trip():
    updated = {
        "interface": None,
        "port_scan_threshold": 25,
        "port_scan_window": 12.0,
        "spike_multiplier": 5.0,
        "spike_min_baseline": 15000,
        "spike_sustain_samples": 2,
        "spike_cooldown": 20.0,
    }
    put_response = client.put("/api/settings/capture", json=updated)
    assert put_response.status_code == 200
    assert put_response.json()["port_scan_threshold"] == 25

    get_response = client.get("/api/settings/capture")
    assert get_response.status_code == 200
    assert get_response.json()["port_scan_threshold"] == 25


def test_retention_settings_round_trip():
    put_response = client.put("/api/settings/retention", json={"retention_days": 7})
    assert put_response.status_code == 200

    get_response = client.get("/api/settings/retention")
    assert get_response.json()["retention_days"] == 7


def test_retention_prune_runs_without_error():
    response = client.post("/api/settings/retention/prune")
    assert response.status_code == 200
    body = response.json()
    assert "dns_deleted" in body
    assert "alerts_deleted" in body
    assert "bandwidth_deleted" in body