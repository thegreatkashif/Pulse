import tempfile
from pathlib import Path

import pytest

import pulse.database.db as db_module


@pytest.fixture(autouse=True)
def isolated_database(monkeypatch):
    """Every test gets its own throwaway SQLite file so tests never touch
    the real backend/data/pulse.db, and tests can't interfere with each other.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        test_db_path = Path(tmpdir) / "test_pulse.db"
        monkeypatch.setattr(db_module, "DB_PATH", test_db_path)
        db_module.init_db()
        yield test_db_path