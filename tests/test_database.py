import contextlib
import io
import os
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


if __name__ == "__main__":
    unittest.main()
