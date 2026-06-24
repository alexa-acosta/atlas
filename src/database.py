import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.getenv("ATLAS_DB_PATH", "data/atlas.db")


def _conn() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)


def init_db():
    with _conn() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp  TEXT    NOT NULL,
                mode       TEXT    NOT NULL DEFAULT 'unknown',
                source     TEXT    NOT NULL DEFAULT '',
                raw_input  TEXT    NOT NULL,
                risk_score INTEGER NOT NULL,
                verdict    TEXT    NOT NULL
            )
        """)
        try:
            c.execute("ALTER TABLE scans ADD COLUMN mode TEXT NOT NULL DEFAULT 'unknown'")
        except sqlite3.OperationalError:
            pass
        try:
            c.execute("ALTER TABLE scans ADD COLUMN source TEXT NOT NULL DEFAULT ''")
        except sqlite3.OperationalError:
            pass
        c.commit()


def save_scan(raw_input: str, risk_score: int, verdict: str,
              mode: str = "unknown", source: str = "") -> int:
    ts = datetime.now(timezone.utc).isoformat()
    with _conn() as c:
        cur = c.execute(
            "INSERT INTO scans (timestamp, mode, source, raw_input, risk_score, verdict) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (ts, mode, source, raw_input, risk_score, verdict),
        )
        c.commit()
        return cur.lastrowid


def get_scan_by_id(scan_id: int) -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT id, timestamp, mode, source, risk_score, verdict, raw_input "
            "FROM scans WHERE id = ?", (scan_id,)
        ).fetchone()
    return _to_dict(row) if row else None


def get_scan_history(limit: int = 20):
    with _conn() as c:
        rows = c.execute(
            "SELECT id, timestamp, mode, source, risk_score, verdict "
            "FROM scans ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()

    if not rows:
        print("No scans in history yet.")
        return

    print(f"\n{'ID':<5} {'Timestamp':<22} {'Mode':<14} {'Score':<7} {'Verdict':<8}  Source")
    print("─" * 80)
    for r in rows:
        src = (r[3] or "")[:30]
        print(f"{r[0]:<5} {r[1][:19]:<22} {r[2]:<14} {r[4]:<7} {r[5]:<8}  {src}")
    print()


def get_high_risk_scans() -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT id, timestamp, mode, source, risk_score, verdict, raw_input "
            "FROM scans WHERE verdict = 'high'"
        ).fetchall()
    return [_to_dict(r) for r in rows]


def _to_dict(row: tuple) -> dict:
    return {
        "id": row[0], "timestamp": row[1], "mode": row[2],
        "source": row[3], "risk_score": row[4], "verdict": row[5], "raw_input": row[6],
    }