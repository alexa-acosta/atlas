from email import message_from_string
from urllib.parse import urlparse
from unstructured.cleaners.extract import (
    extract_email_address,
    extract_ip_address,
    extract_ip_address_name,
    extract_datetimetz
)
from parsedresult import ParsedResult
from flattenedtext import FlattenedText

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
    
    def extract_domains(self, urls: list) -> list:
        domains = []

        for url in urls:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc

            if domain:
                domains.append(domain)
        
        return self.remove_duplicates(domains)

    def extract_email_addresses(self, text: str) -> list:
        return extract_email_address(text)

    def parse_email(self, text: str) -> dict:
        message = message_from_string(text)

        headers = {}

        important_headers = [
            "From",
            "To",
            "Subject",
            "Date",
            "Return-Path",
            "Reply-To",
            "Message-ID",
            "Received-SPF",
            "Authentication-Results",
            "ARC-Authentication-Results"
        ]

        dkim_signatures = message.get_all("DKIM-Signature")
        
        if dkim_signatures:
            headers["DKIM-Signature"] = dkim_signatures

        for header in important_headers:
            value = message.get(header)

            if value:
                headers[header] = value

        received_headers = message.get_all("Received")

        if received_headers:
            headers["Received-All"] = received_headers
            headers["Received-IPs"] = []
            headers["Received-Server-Names"] = []
            headers["Received-Datetimes"] = []

            # from dictionary's established lists of above, update with extracted values using Unstructured
            for received in received_headers:
                headers["Received-IPs"].extend(
                    extract_ip_address(received)
                )

                headers["Received-Server-Names"].extend(
                    extract_ip_address_name(received)
                )

                try:
                    datetime_value = extract_datetimetz(received)
                    headers["Received-Datetimes"].append(str(datetime_value))
                except Exception:
                    pass
            
            headers["Received-IPs"] = self.remove_duplicates(headers["Received-IPs"])
            headers["Received-Server-Names"] = self.remove_duplicates(headers["Received-Server-Names"])
            headers["Received-Datetimes"] = self.remove_duplicates(headers["Received-Datetimes"])

        return headers
    
    def remove_duplicates(self, items: list) -> list:
        unique_items = []

        for item in items:
            if item not in unique_items:
                unique_items.append(item)

        return unique_items