import unittest

from src.apiresults import APIResults
from src.scorer import Scorer


class TestScorer(unittest.TestCase):
    def setUp(self):
        self.scorer = Scorer()

    def test_calculate_score_uses_weighted_api_results(self):
        results = APIResults(
            vt_result={
                "data": {
                    "attributes": {
                        "last_analysis_stats": {
                            "harmless": 7,
                            "malicious": 2,
                            "suspicious": 1,
                        }
                    }
                }
            },
            cm_result={"ThreatScore": 6},
            gemini_text="70% likely fraudulent score\n- Fake check\n- Urgent tone\n- Odd URL",
        )

        scan_result = self.scorer.calculate_score(results)

        self.assertEqual(scan_result.risk_score, 69)
        self.assertEqual(scan_result.verdict, "high")
        self.assertEqual(scan_result.indicators, ["Fake check", "Urgent tone", "Odd URL"])

    def test_calculate_score_falls_back_without_gemini_text(self):
        results = APIResults(
            vt_result={
                "data": {
                    "attributes": {
                        "last_analysis_stats": {
                            "harmless": 4,
                            "malicious": 1,
                            "suspicious": 1,
                        }
                    }
                }
            },
            cm_result={"CleanResult": False},
        )

        scan_result = self.scorer.calculate_score(results)

        self.assertEqual(scan_result.risk_score, 77)
        self.assertEqual(scan_result.verdict, "high")
        self.assertEqual(scan_result.summary, "No analysis available.")

    def test_score_helpers_handle_missing_and_out_of_range_values(self):
        self.assertIsNone(self.scorer._score_virustotal({}))
        self.assertIsNone(self.scorer._score_cloudmersive({}))
        self.assertIsNone(self.scorer._score_gemini(""))
        self.assertEqual(self.scorer._score_gemini("150% likely fraudulent score"), 100)
        self.assertEqual(self.scorer._score_cloudmersive({"ThreatScore": 15}), 100)
        self.assertEqual(self.scorer._verdict(34), "safe")
        self.assertEqual(self.scorer._verdict(35), "medium")
        self.assertEqual(self.scorer._verdict(65), "high")


if __name__ == "__main__":
    unittest.main()
