import contextlib
import io
import os
import sqlite3
import tempfile
import unittest

from src import database


class TestDatabase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.original_db_path = database.DB_PATH
        self.addCleanup(setattr, database, "DB_PATH", self.original_db_path)
        database.DB_PATH = os.path.join(self.temp_dir.name, "atlas.db")

    def test_init_save_and_get_scan_by_id(self):
        database.init_db()

        scan_id = database.save_scan(
            "raw input",
            82,
            "high",
            mode="email",
            source="pasted email",
        )
        scan = database.get_scan_by_id(scan_id)

        self.assertEqual(scan["id"], scan_id)
        self.assertEqual(scan["mode"], "email")
        self.assertEqual(scan["source"], "pasted email")
        self.assertEqual(scan["raw_input"], "raw input")
        self.assertEqual(scan["risk_score"], 82)
        self.assertEqual(scan["verdict"], "high")

    def test_get_high_risk_scans_filters_by_verdict(self):
        database.init_db()
        high_id = database.save_scan("bad", 95, "high")
        database.save_scan("ok", 15, "safe")

        high_risk = database.get_high_risk_scans()

        self.assertEqual(len(high_risk), 1)
        self.assertEqual(high_risk[0]["id"], high_id)
        self.assertEqual(high_risk[0]["raw_input"], "bad")

    def test_get_scan_history_prints_empty_message(self):
        database.init_db()
        output = io.StringIO()

        with contextlib.redirect_stdout(output):
            database.get_scan_history()

        self.assertIn("No scans in history yet.", output.getvalue())

    def test_init_db_migrates_existing_scans_table(self):
        with sqlite3.connect(database.DB_PATH) as connection:
            connection.execute("""
                CREATE TABLE scans (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp  TEXT    NOT NULL,
                    raw_input  TEXT    NOT NULL,
                    risk_score INTEGER NOT NULL,
                    verdict    TEXT    NOT NULL
                )
            """)
            connection.execute(
                "INSERT INTO scans (timestamp, raw_input, risk_score, verdict) "
                "VALUES (?, ?, ?, ?)",
                ("2026-07-22T09:00:00+00:00", "legacy input", 42, "medium"),
            )

        database.init_db()

        scans = database.list_scans()
        self.assertEqual(len(scans), 1)
        self.assertEqual(scans[0]["summary"], "")
        self.assertEqual(scans[0]["indicators"], [])
        self.assertEqual(scans[0]["mode"], "unknown")


if __name__ == "__main__":
    unittest.main()
