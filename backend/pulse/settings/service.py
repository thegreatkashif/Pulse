from pulse.database.db import get_setting, set_setting
from pulse.settings.schemas import CapturePreferences, RetentionSettings


def get_capture_preferences() -> CapturePreferences:
    raw = get_setting("capture_preferences")
    if raw:
        return CapturePreferences.model_validate_json(raw)
    return CapturePreferences()


def save_capture_preferences(prefs: CapturePreferences) -> None:
    set_setting("capture_preferences", prefs.model_dump_json())


def get_retention_settings() -> RetentionSettings:
    raw = get_setting("retention_settings")
    if raw:
        return RetentionSettings.model_validate_json(raw)
    return RetentionSettings()


def save_retention_settings(settings: RetentionSettings) -> None:
    set_setting("retention_settings", settings.model_dump_json())