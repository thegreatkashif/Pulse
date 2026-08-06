import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "pulse.db"


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS dns_queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL NOT NULL,
                domain TEXT NOT NULL,
                resolved_ips TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS security_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL NOT NULL,
                severity TEXT NOT NULL,
                category TEXT NOT NULL,
                message TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS bandwidth_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL NOT NULL,
                bytes_in INTEGER NOT NULL,
                bytes_out INTEGER NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)
        conn.commit()


@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()


def insert_dns_query(timestamp: float, domain: str, resolved_ips: str | None) -> None:
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO dns_queries (timestamp, domain, resolved_ips) VALUES (?, ?, ?)",
            (timestamp, domain, resolved_ips),
        )
        conn.commit()


def get_recent_dns(limit: int = 100) -> list[dict]:
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM dns_queries ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(row) for row in rows]


def insert_alert(timestamp: float, severity: str, category: str, message: str) -> None:
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO security_alerts (timestamp, severity, category, message) VALUES (?, ?, ?, ?)",
            (timestamp, severity, category, message),
        )
        conn.commit()


def get_recent_alerts(limit: int = 100) -> list[dict]:
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM security_alerts ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(row) for row in rows]


def insert_bandwidth_sample(timestamp: float, bytes_in: int, bytes_out: int) -> None:
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO bandwidth_history (timestamp, bytes_in, bytes_out) VALUES (?, ?, ?)",
            (timestamp, bytes_in, bytes_out),
        )
        conn.commit()


def get_bandwidth_history(limit: int = 500) -> list[dict]:
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM bandwidth_history ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(row) for row in reversed(rows)]


def get_setting(key: str) -> str | None:
    with get_connection() as conn:
        row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row[0] if row else None


def set_setting(key: str, value: str) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            (key, value),
        )
        conn.commit()


def prune_old_data(retention_days: int) -> dict:
    cutoff = __import__("time").time() - (retention_days * 86400)
    with get_connection() as conn:
        dns_deleted = conn.execute("DELETE FROM dns_queries WHERE timestamp < ?", (cutoff,)).rowcount
        alerts_deleted = conn.execute("DELETE FROM security_alerts WHERE timestamp < ?", (cutoff,)).rowcount
        bw_deleted = conn.execute("DELETE FROM bandwidth_history WHERE timestamp < ?", (cutoff,)).rowcount
        conn.commit()
    return {"dns_deleted": dns_deleted, "alerts_deleted": alerts_deleted, "bandwidth_deleted": bw_deleted}