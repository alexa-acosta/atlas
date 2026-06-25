from email import message_from_string
from urllib.parse import urlparse
from unstructured.cleaners.extract import (
    extract_email_address,
    extract_ip_address,
    extract_ip_address_name,
    extract_datetimetz
)
from parsedresult import ParsedResult
from src.flattenedtext import FlattenedText

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
    
    def extract_urls(self, text: str) -> list:
        urls = []

        for word in text.split():
            word = word.strip(".,!<>\"'")

            if word.startswith("http://") or word.startswith("https://"):
                urls.append(word)
            elif word.startswith("www."):
                urls.append("https://" + word)

        return self.remove_duplicates(urls)

    def remove_duplicates(self, items: list) -> list:
        unique_items = []

        for item in items:
            if item not in unique_items:
                unique_items.append(item)

        return unique_items
    
    def extract_domains(self, urls: list) -> list:
        domains = []

        for url in urls:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc

            if domain:
                domains.append(domain)
        
        return self.remove_duplicates(domains)
