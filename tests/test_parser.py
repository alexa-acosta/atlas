import unittest
from unittest.mock import patch

from src.flattenedtext import FlattenedText
from src.parsedresult import ParsedResult
from src.parser import Parser


class TestParser(unittest.TestCase):
    def setUp(self):
        self.parser = Parser()

    def test_parse_creates_parsed_result_from_flattened_text(self):
        flattened = FlattenedText(
            "From: recruiter@example.com\nSubject: Job\n\nVisit https://jobs.example.com",
            "Email recruiter@example.com or visit https://jobs.example.com.",
        )

        parsed = self.parser.parse(flattened)

        self.assertIsInstance(parsed, ParsedResult)
        self.assertEqual(parsed.urls, ["https://jobs.example.com"])
        self.assertEqual(parsed.domains, ["jobs.example.com"])
        self.assertIn("recruiter@example.com", parsed.email_addresses)
        self.assertEqual(parsed.email_headers["From"], "recruiter@example.com")

    def test_extract_urls_normalizes_www_and_removes_duplicates(self):
        text = "Apply at www.example.com, then https://example.org! www.example.com"

        urls = self.parser.extract_urls(text)

        self.assertEqual(urls, ["https://www.example.com", "https://example.org"])

    def test_parse_email_collects_received_ip_without_duplicates(self):
        email_text = (
            "From: sender@example.com\n"
            "To: user@example.com\n"
            "Received: from mail.example.com (192.0.2.10) by mx.example.com;\n"
            "Received: from mail.example.com (192.0.2.10) by mx.example.com;\n"
            "\nBody"
        )

        with patch("src.parser.extract_ip_address", return_value=["192.0.2.10", "192.0.2.10"]):
            headers = self.parser.parse_email(email_text)

        self.assertEqual(headers["From"], "sender@example.com")
        self.assertEqual(headers["To"], "user@example.com")
        self.assertEqual(headers["Received-IPs"], ["192.0.2.10"])


if __name__ == "__main__":
    unittest.main()
