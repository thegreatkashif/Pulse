from pydantic import BaseModel


class CapturePreferences(BaseModel):
    interface: str | None = None  # None = auto-detect (current behavior)
    port_scan_threshold: int = 15
    port_scan_window: float = 10.0
    spike_multiplier: float = 6.0
    spike_min_baseline: int = 20_000
    spike_sustain_samples: int = 3
    spike_cooldown: float = 30.0


class RetentionSettings(BaseModel):
    retention_days: int = 30