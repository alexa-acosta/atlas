import importlib
import os
import sys
import tempfile
import types
import unittest
from unittest.mock import Mock, patch

from src.flattenedtext import FlattenedText
from src.parsedresult import ParsedResult
from src.scanresult import ScanResult


_ATLASSCANNER_MODULE = None


def import_atlasscanner_with_fake_gemini():
    global _ATLASSCANNER_MODULE
    if _ATLASSCANNER_MODULE is not None:
        return _ATLASSCANNER_MODULE

    fake_google = types.ModuleType("google")
    fake_genai = types.ModuleType("google.genai")
    fake_types = types.ModuleType("google.genai.types")
    fake_genai.Client = Mock()
    fake_google.genai = fake_genai
    fake_genai.types = fake_types

    with patch.dict(
        sys.modules,
        {
            "google": fake_google,
            "google.genai": fake_genai,
            "google.genai.types": fake_types,
        },
    ):
        module = importlib.import_module("src.atlasscanner")
        _ATLASSCANNER_MODULE = module
        return module


def build_scanner(module):
    with patch.object(module, "Gemini", return_value=Mock()):
        return module.AtlasScanner()


class TestAtlasScanner(unittest.TestCase):
    def test_scan_creates_scan_input_api_results_and_scan_result(self):
        module = import_atlasscanner_with_fake_gemini()
        flattened = FlattenedText("raw job text", "clean job text")
        parsed = ParsedResult(["https://example.com"], ["example.com"], [], {}, "clean job text")
        scan_result = ScanResult(40, "medium", "40% likely fraudulent score", ["reason"])

        scanner = build_scanner(module)
        scanner.text_flattener = Mock(flatten=Mock(return_value=flattened))
        scanner.parser = Mock(parse=Mock(return_value=parsed))
        scanner.virustotal = Mock(scan_url=Mock(return_value={"vt": True}))
        scanner.safebrowsing = Mock(check_url=Mock(return_value={"safe": True}))
        scanner.cloudmersive = Mock(analyze_language=Mock(return_value={"cm": True}))
        scanner.gemini = Mock(analyze_results=Mock(return_value="40% likely fraudulent score"))
        scanner.scorer = Mock(calculate_score=Mock(return_value=scan_result))
        scanner.output_formatter = Mock()

        with patch.object(module, "save_scan") as save_scan:
            result = scanner.scan("raw job text", mode="job_post", source="pasted")

        self.assertIs(result, scan_result)
        scanner.text_flattener.flatten.assert_called_once_with("raw job text")
        scanner.parser.parse.assert_called_once_with(flattened)
        scanner.gemini.analyze_results.assert_called_once()
        api_results = scanner.scorer.calculate_score.call_args.args[0]
        self.assertEqual(api_results.vt_result, {"vt": True})
        self.assertEqual(api_results.np_result, {"safe": True})
        self.assertEqual(api_results.cm_result, {"cm": True})
        self.assertEqual(api_results.gemini_text, "40% likely fraudulent score")
        save_scan.assert_called_once_with(
            "raw job text",
            40,
            "medium",
            mode="job_post",
            source="pasted",
            user_id=None,
            indicators=["reason"],
        )
        scanner.output_formatter.display.assert_called_once_with(scan_result, mode="job_post", source="pasted")

    def test_scan_uses_document_extraction_for_pdf_input(self):
        module = import_atlasscanner_with_fake_gemini()
        scan_result = ScanResult(40, "medium", "40% likely fraudulent score", ["reason"])
        flattened = FlattenedText("PDF body text", "clean pdf text")
        parsed = ParsedResult([], [], [], {}, "clean pdf text")

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
            pdf_path = temp_file.name
        self.addCleanup(lambda: os.path.exists(pdf_path) and os.remove(pdf_path))

        scanner = build_scanner(module)
        scanner.text_flattener = Mock(
            extract_text_from_document=Mock(return_value="PDF body text"),
            flatten=Mock(return_value=flattened),
        )
        scanner.parser = Mock(parse=Mock(return_value=parsed))
        scanner.virustotal = Mock(scan_url=Mock(return_value={}), scan_domain=Mock(return_value={}), scan_ip=Mock(return_value={}))
        scanner.safebrowsing = Mock(check_url=Mock(return_value={}))
        scanner.cloudmersive = Mock(analyze_language=Mock(return_value={"cm": True}))
        scanner.gemini = Mock(analyze_results=Mock(return_value="40% likely fraudulent score"))
        scanner.scorer = Mock(calculate_score=Mock(return_value=scan_result))
        scanner.output_formatter = Mock()

        with patch.object(module, "save_scan") as save_scan, patch.object(module, "fetch_url") as fetch_url:
            result = scanner.scan(pdf_path, mode="offer_letter", source=pdf_path)

        self.assertIs(result, scan_result)
        scanner.text_flattener.extract_text_from_document.assert_called_once_with(pdf_path)
        scanner.text_flattener.flatten.assert_called_once_with("PDF body text")
        fetch_url.assert_not_called()
        save_scan.assert_called_once_with(
            "PDF body text",
            40,
            "medium",
            mode="offer_letter",
            source=pdf_path,
            user_id=None,
            indicators=["reason"],
        )

    def test_prepare_raw_input_does_not_check_long_pasted_text_as_pdf_path(self):
        module = import_atlasscanner_with_fake_gemini()
        scanner = build_scanner(module)
        raw_text = "About the job\n" + ("Journey with us. " * 40)

        with patch.object(module.Path, "is_file") as is_file:
            prepared = scanner._prepare_raw_input(raw_text)

        is_file.assert_not_called()
        self.assertEqual(prepared, raw_text)

    def test_prepare_raw_input_does_not_check_long_single_line_text_as_pdf_path(self):
        module = import_atlasscanner_with_fake_gemini()
        scanner = build_scanner(module)
        raw_text = "This is a pasted job description. " * 20

        with patch.object(module.Path, "is_file") as is_file:
            prepared = scanner._prepare_raw_input(raw_text)

        is_file.assert_not_called()
        self.assertEqual(prepared, raw_text)

    def test_scan_virustotal_prefers_url_then_domain_then_received_ip(self):
        module = import_atlasscanner_with_fake_gemini()
        scanner = build_scanner(module)
        scanner.virustotal = Mock(
            scan_url=Mock(return_value={"url": True}),
            scan_domain=Mock(return_value={"domain": True}),
            scan_ip=Mock(return_value={"ip": True}),
        )

        with_url = Mock(parsed_input=ParsedResult(["https://example.com"], ["example.com"], [], {}, ""))
        with_domain = Mock(parsed_input=ParsedResult([], ["example.com"], [], {}, ""))
        with_ip = Mock(parsed_input=ParsedResult([], [], [], {"Received-IPs": ["192.0.2.10"]}, ""))

        self.assertEqual(scanner._scan_virustotal(with_url), {"url": True})
        self.assertEqual(scanner._scan_virustotal(with_domain), {"domain": True})
        self.assertEqual(scanner._scan_virustotal(with_ip), {"ip": True})
        scanner.virustotal.scan_url.assert_called_once_with("https://example.com")
        scanner.virustotal.scan_domain.assert_called_once_with("example.com")
        scanner.virustotal.scan_ip.assert_called_once_with("192.0.2.10")

    def test_scan_helpers_return_empty_results_when_no_targets(self):
        module = import_atlasscanner_with_fake_gemini()
        scanner = build_scanner(module)
        no_targets = Mock(
            parsed_input=ParsedResult([], [], [], {}, ""),
            flattened_user_input=FlattenedText("raw", "clean"),
        )
        scanner.cloudmersive = Mock(analyze_language=Mock(return_value={"CleanResult": True}))

        self.assertEqual(scanner._scan_virustotal(no_targets), {})
        self.assertEqual(scanner._scan_safebrowsing(no_targets), {})
        self.assertEqual(scanner._scan_cloudmersive(no_targets), {"CleanResult": True})
        scanner.cloudmersive.analyze_language.assert_called_once_with("clean")
    

if __name__ == "__main__":
    unittest.main()
