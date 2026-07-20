from __future__ import annotations

import json
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
                verdict    TEXT    NOT NULL,
                user_id    INTEGER,
                indicators TEXT NOT NULL DEFAULT '[]',
                summary   TEXT  NOT NULL DEFAULT ''
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT    NOT NULL UNIQUE,
                password_hash TEXT    NOT NULL,
                created_at    TEXT    NOT NULL
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
        try:
            c.execute("ALTER TABLE scans ADD COLUMN user_id INTEGER")
        except sqlite3.OperationalError:
            pass
        c.commit()
        try:
            c.execute("ALTER TABLE scans ADD COLUMN indicators TEXT NOT NULL DEFAULT '[]'")
        except sqlite3.OperationalError:
            pass


def save_scan(raw_input: str, risk_score: int, verdict: str,
              mode: str = "unknown", source: str = "", user_id: int | None = None, indicators: list[str] | None = None, summary: str = "") -> int:
    ts = datetime.now(timezone.utc).isoformat()
    with _conn() as c:
        cur = c.execute(
            "INSERT INTO scans (timestamp, mode, source, raw_input, risk_score, verdict, user_id, indicators, summary) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (ts, mode, source, raw_input, risk_score, verdict, user_id, json.dumps(indicators or []), summary),
        )
        c.commit()
        return cur.lastrowid


def list_scans(limit: int = 20, user_id: int | None = None) -> list[dict]:
    with _conn() as c:
        if user_id is not None:
            rows = c.execute(
                "SELECT id, timestamp, mode, source, risk_score, verdict, indicators, summary "
                "FROM scans WHERE user_id = ? ORDER BY id DESC LIMIT ?",
                (user_id, limit)
            ).fetchall()
        else:
            rows = c.execute(
                "SELECT id, timestamp, mode, source, risk_score, verdict, indicators, summary "
                "FROM scans ORDER BY id DESC LIMIT ?", (limit,)
            ).fetchall()
    return [_to_history_dict(r) for r in rows]


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


def create_user(email: str, password_hash: str) -> int | None:
    try:
        ts = datetime.now(timezone.utc).isoformat()
        with _conn() as c:
            cur = c.execute(
                "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
                (email, password_hash, ts)
            )
            c.commit()
            return cur.lastrowid
    except sqlite3.IntegrityError:
        return None


def get_user_by_email(email: str) -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?", (email,)
        ).fetchone()
    if not row:
        return None
    return {"id": row[0], "email": row[1], "password_hash": row[2]}


def _to_dict(row: tuple) -> dict:
    return {
        "id": row[0], "timestamp": row[1], "mode": row[2],
        "source": row[3], "risk_score": row[4], "verdict": row[5], "raw_input": row[6],
    }


def _to_history_dict(row: tuple) -> dict:
    return {
        "id": row[0], "timestamp": row[1], "mode": row[2],
        "source": row[3], "risk_score": row[4], "verdict": row[5], "indicators": json.loads(row[6]), "summary": row[7],
    }
