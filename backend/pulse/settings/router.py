from fastapi import APIRouter

from pulse.capture.engine import engine
from pulse.security.detector import detector
from pulse.settings.schemas import CapturePreferences, RetentionSettings
from pulse.settings.service import (
    get_capture_preferences,
    get_retention_settings,
    save_capture_preferences,
    save_retention_settings,
)

router = APIRouter(prefix="/api/settings", tags=["Settings"])


def _apply_capture_preferences(prefs: CapturePreferences) -> None:
    detector.configure(
        port_scan_threshold=prefs.port_scan_threshold,
        port_scan_window=prefs.port_scan_window,
        spike_multiplier=prefs.spike_multiplier,
        spike_min_baseline=prefs.spike_min_baseline,
        spike_sustain_samples=prefs.spike_sustain_samples,
        spike_cooldown=prefs.spike_cooldown,
    )
    engine.preferred_interface = prefs.interface


@router.get("/capture", response_model=CapturePreferences)
async def read_capture_preferences():
    return get_capture_preferences()


@router.put("/capture", response_model=CapturePreferences)
async def update_capture_preferences(prefs: CapturePreferences):
    save_capture_preferences(prefs)
    _apply_capture_preferences(prefs)
    return prefs


@router.get("/retention", response_model=RetentionSettings)
async def read_retention_settings():
    return get_retention_settings()


@router.put("/retention", response_model=RetentionSettings)
async def update_retention_settings(settings: RetentionSettings):
    save_retention_settings(settings)
    return settings