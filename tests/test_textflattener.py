import os
import tempfile
import unittest
from unittest.mock import patch

from src.textflattener import TextFlattener


class TestTextFlattener(unittest.TestCase):
    def setUp(self):
        self.flattener = TextFlattener()

    def test_flatten_creates_flattened_text_for_plain_input(self):
        flattened = self.flattener.flatten("Hello\n\n   world")

        self.assertEqual(flattened.cleaned_text, "Hello world")

    def test_flatten_converts_html_input(self):
        flattened = self.flattener.flatten("<html><body><p>Hello</p><a href='https://example.com'>Apply</a></body></html>")

        self.assertIn("Hello", flattened.cleaned_text)
        self.assertIn("Apply", flattened.cleaned_text)

    def test_flatten_reads_document_when_input_is_path(self):
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file_path = temp_file.name
        self.addCleanup(lambda: os.path.exists(file_path) and os.remove(file_path))

        with patch.object(self.flattener, "extract_text_from_document", return_value="Document text") as extract:
            flattened = self.flattener.flatten(file_path)

        extract.assert_called_once_with(file_path)
        self.assertEqual(flattened.cleaned_text, "Document text")

    @patch.object(TextFlattener, "_partition_pdf_document")
    def test_extract_text_from_document_uses_partition_pdf_for_pdf_files(self, partition_pdf_document):
        partition_pdf_document.return_value = ["First page", "Second page"]

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
            file_path = temp_file.name
        self.addCleanup(lambda: os.path.exists(file_path) and os.remove(file_path))

        extracted = self.flattener.extract_text_from_document(file_path)

        partition_pdf_document.assert_called_once_with(file_path)
        self.assertEqual(extracted, "First page\nSecond page")

    @patch("src.textflattener.partition")
    def test_extract_text_from_document_uses_auto_partition_for_non_pdf_files(self, partition):
        partition.return_value = ["Plain", "Document"]

        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as temp_file:
            file_path = temp_file.name
        self.addCleanup(lambda: os.path.exists(file_path) and os.remove(file_path))

        extracted = self.flattener.extract_text_from_document(file_path)

        partition.assert_called_once_with(filename=file_path)
        self.assertEqual(extracted, "Plain\nDocument")


if __name__ == "__main__":
    unittest.main()
