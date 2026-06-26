import io
import unittest
from contextlib import redirect_stdout

from src.outputformatter import DIM, GRN, OutputFormatter
from src.scanresult import ScanResult


class TestOutputFormatter(unittest.TestCase):
    def setUp(self):
        self.formatter = OutputFormatter()

    def test_verdict_color_defaults_for_unknown_verdict(self):
        self.assertEqual(self.formatter._verdict_color("safe"), GRN)
        self.assertEqual(self.formatter._verdict_color("unknown"), DIM)

    def test_summary_strips_score_line_and_reason_bullets(self):
        summary = "80% likely fraudulent score\n- First reason\nDetailed analysis line"
        output = io.StringIO()

        with redirect_stdout(output):
            self.formatter._summary(summary)

        rendered = output.getvalue()
        self.assertIn("Analysis", rendered)
        self.assertIn("Detailed analysis line", rendered)
        self.assertNotIn("80% likely fraudulent score", rendered)
        self.assertNotIn("First reason", rendered)

    def test_display_renders_score_indicators_and_footer(self):
        result = ScanResult(65, "high", "Detailed analysis", ["Odd request"])
        output = io.StringIO()

        with redirect_stdout(output):
            self.formatter.display(result, mode="job_post", source="pasted")

        rendered = output.getvalue()
        self.assertIn("Scan Results", rendered)
        self.assertIn("Job Posting", rendered)
        self.assertIn("65/100", rendered)
        self.assertIn("Odd request", rendered)
        self.assertIn("Detailed analysis", rendered)


if __name__ == "__main__":
    unittest.main()
