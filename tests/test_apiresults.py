import unittest

from src.apiresults import APIResults


class TestAPIResultsFormatting(unittest.TestCase):
    def test_formats_virustotal_stats_and_categories(self):
        results = APIResults(
            vt_result={
                "data": {
                    "attributes": {
                        "last_analysis_stats": {
                            "harmless": 8,
                            "malicious": 1,
                            "suspicious": 1,
                        },
                        "reputation": -3,
                        "categories": {
                            "engine-a": "phishing",
                            "engine-b": "malware",
                            "engine-c": "phishing",
                        },
                    }
                }
            }
        )

        text = results.to_string()

        self.assertIn("=== VirusTotal Results ===", text)
        self.assertIn("Malicious engines: 1 / 10", text)
        self.assertIn("Suspicious engines: 1", text)
        self.assertIn("Reputation score: -3", text)
        self.assertIn("Categories:", text)

    def test_formats_safe_browsing_threats_and_clean_fallback(self):
        threat_text = APIResults(np_result={"threat": "SOCIAL_ENGINEERING"}).to_string()
        clean_text = APIResults(np_result={"matches": []}).to_string()

        self.assertIn("Threat: SOCIAL_ENGINEERING", threat_text)
        self.assertIn("No threat data returned.", clean_text)

    def test_formats_cloudmersive_flagged_urls(self):
        results = APIResults(
            cm_result={
                "CleanResult": False,
                "ThreatScore": 7,
                "AnalysisRationale": "Suspicious hiring language",
                "UrlAnalysis": [
                    {"Url": "https://safe.example", "IsClean": True},
                    {"Url": "https://bad.example", "IsClean": False},
                ],
            }
        )

        text = results.to_string()

        self.assertIn("=== Cloudmersive Results ===", text)
        self.assertIn("Clean: False", text)
        self.assertIn("Threat score: 7/10", text)
        self.assertIn("Rationale: Suspicious hiring language", text)
        self.assertIn("Flagged URLs: 1 / 2", text)


if __name__ == "__main__":
    unittest.main()
