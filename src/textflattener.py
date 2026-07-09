import os
from pathlib import Path
import ftfy
import html2text
from email import message_from_string
from unstructured.partition.auto import partition
from unstructured.cleaners.core import (
    clean,
    group_broken_paragraphs,
    replace_unicode_quotes,
    bytes_string_to_string
)
from src.flattenedtext import FlattenedText

class TextFlattener:
    def flatten(self, raw_input: str) -> FlattenedText:
        original_text = raw_input

        if self.looks_like_file_path(raw_input) and os.path.exists(raw_input):
            raw_input = self.extract_text_from_document(raw_input)

        clean_text = self.fix_encoding(raw_input)

        if self.looks_like_html(clean_text):
            clean_text = self.convert_html(clean_text)

        clean_text = self.clean_whitespace(clean_text)

        return FlattenedText(original_text, clean_text)

    def extract_text_from_document(self, file_path: str) -> str:
        if Path(file_path).suffix.lower() == ".pdf":
            elements = self._partition_pdf_document(file_path)
        else:
            elements = partition(filename=file_path)
        return "\n".join(str(element) for element in elements)

    def _partition_pdf_document(self, file_path: str):
        # Prefer text extraction for PDFs and let Unstructured fall back as needed.
        from unstructured.partition.pdf import partition_pdf

        return partition_pdf(filename=file_path, strategy="fast")

    def looks_like_file_path(self, value: str) -> bool:
        if not value or "\n" in value or "\r" in value:
            return False

        if len(value) > 255:
            return False

        path = Path(value).expanduser()

        return (
            path.is_absolute()
            or value.startswith(("./", "../", "~"))
            or path.suffix.lower() in {".pdf", ".doc", ".docx", ".txt", ".html", ".htm"}
        )

    def fix_encoding(self, text: str) -> str:
        text = ftfy.fix_text(text)
        text = replace_unicode_quotes(text)
        return text

    def looks_like_html(self, text: str) -> bool:
        lowered = text.lower()

        return (
            "<html" in lowered
            or "<body" in lowered
            or "<p>" in lowered
            or "</p" in lowered
            or "<a " in lowered
            or "</div" in lowered
        )

    def convert_html(self, text: str) -> str:
        return html2text.html2text(text)

    def clean_whitespace(self, text: str) -> str:
        text = group_broken_paragraphs(text)

        text = clean(
            text,
            bullets=False,
            extra_whitespace=True,
            dashes=True,
            trailing_punctuation=False,
            lowercase=False
        )

        return text.strip()
    
