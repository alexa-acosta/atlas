import importlib.util
import io
import os
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


class TestScanRoute(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.api_module_name = "atlas_scan_route_api"
        self.addCleanup(sys.modules.pop, self.api_module_name, None)

        api_path = Path(__file__).resolve().parents[1] / "react-with-flask" / "api" / "api.py"
        spec = importlib.util.spec_from_file_location(self.api_module_name, api_path)
        self.api_module = importlib.util.module_from_spec(spec)

        with patch.dict(os.environ, {"ATLAS_DB_PATH": str(Path(self.temp_dir.name) / "atlas.db")}):
            spec.loader.exec_module(self.api_module)

        self.client = self.api_module.app.test_client()

    def test_offer_letter_upload_adds_extracted_pdf_text_to_raw_user_input(self):
        scanner = Mock()
        scanner.scan.return_value = types.SimpleNamespace(
            scan_id=123,
            risk_score=40,
            verdict="medium",
            summary="40% likely fraudulent score",
            indicators=["reason"],
        )

        fake_atlasscanner = types.ModuleType("src.atlasscanner")
        fake_atlasscanner.AtlasScanner = Mock(return_value=scanner)

        flattener = Mock()
        flattener.extract_text_from_document.return_value = "PDF body text"
        fake_textflattener = types.ModuleType("src.textflattener")
        fake_textflattener.TextFlattener = Mock(return_value=flattener)

        with patch.dict(
            sys.modules,
            {
                "src.atlasscanner": fake_atlasscanner,
                "src.textflattener": fake_textflattener,
            },
        ):
            response = self.client.post(
                "/api/scan",
                data={
                    "mode": "combined",
                    "source": "job, email, offer.pdf",
                    "raw_input": "=== Job Posting ===\nJob text\n\n=== Recruiter Email ===\nEmail text",
                    "file": (io.BytesIO(b"%PDF-1.4"), "offer.pdf"),
                },
                content_type="multipart/form-data",
            )

        self.assertEqual(response.status_code, 201)
        scanner.scan.assert_called_once_with(
            "=== Job Posting ===\nJob text\n\n"
            "=== Recruiter Email ===\nEmail text\n\n"
            "=== Offer Letter ===\nPDF body text",
            mode="combined",
            source="job, email, offer.pdf",
        )

    def test_offer_letter_only_upload_scans_extracted_pdf_text_not_temp_path(self):
        scanner = Mock()
        scanner.scan.return_value = types.SimpleNamespace(
            scan_id=123,
            risk_score=40,
            verdict="medium",
            summary="40% likely fraudulent score",
            indicators=["reason"],
        )

        fake_atlasscanner = types.ModuleType("src.atlasscanner")
        fake_atlasscanner.AtlasScanner = Mock(return_value=scanner)

        flattener = Mock()
        flattener.extract_text_from_document.return_value = "PDF body text"
        fake_textflattener = types.ModuleType("src.textflattener")
        fake_textflattener.TextFlattener = Mock(return_value=flattener)

        with patch.dict(
            sys.modules,
            {
                "src.atlasscanner": fake_atlasscanner,
                "src.textflattener": fake_textflattener,
            },
        ):
            response = self.client.post(
                "/api/scan",
                data={"mode": "offer_letter", "source": "offer.pdf", "file": (io.BytesIO(b"%PDF-1.4"), "offer.pdf")},
                content_type="multipart/form-data",
            )

        self.assertEqual(response.status_code, 201)
        scanner.scan.assert_called_once_with(
            "=== Offer Letter ===\nPDF body text",
            mode="offer_letter",
            source="offer.pdf",
        )


if __name__ == "__main__":
    unittest.main()
