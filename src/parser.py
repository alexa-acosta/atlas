from email import message_from_string
from urllib.parse import urlparse
from unstructured.cleaners.extract import (
    extract_email_address,
    extract_ip_address,
    extract_ip_address_name,
    extract_datetimetz
)
from parsedresult import ParsedResult

class Parser:
    def parse(self, flattened: FlattenedText) -> ParsedResult:
        cleaned_text = flattened.cleaned_text
        original_text = flattened.original_text

        urls = self.extract_urls(cleaned_text)
        domains = self.extract_domains(urls)
        email_addresses = self.extract_email_addresses(cleaned_text)
        email_headers = self.parse_email(original_text)

        return ParsedResult(
            urls=urls,
            domains=domains,
            email_addresses=email_addresses,
            email_headers=email_headers,
            cleaned_text=cleaned_text
        )