import unittest

from src.apiresults import APIResults
from src.scanresult import ScanResult


class TestScanResult(unittest.TestCase):
    def test_is_high_risk_only_for_high_verdict(self):
        self.assertTrue(ScanResult(90, "high", "", []).is_high_risk())
        self.assertFalse(ScanResult(34, "safe", "", []).is_high_risk())

    def test_indicators_default_to_independent_lists(self):
        first = ScanResult(10, "safe", "")
        second = ScanResult(20, "safe", "")

        first.indicators.append("only first")

        self.assertEqual(first.indicators, ["only first"])
        self.assertEqual(second.indicators, [])


class TestAPIResults(unittest.TestCase):
    def test_default_payloads_are_independent(self):
        first = APIResults()
        second = APIResults()

        first.vt_result["data"] = "value"

        self.assertEqual(first.vt_result, {"data": "value"})
        self.assertEqual(second.vt_result, {})

    def test_to_string_returns_fallback_when_empty(self):
        self.assertEqual(APIResults().to_string(), "No API results available.")


if __name__ == "__main__":
    unittest.main()
