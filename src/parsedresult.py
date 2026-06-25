class ParsedResult:
    def __init__(self, urls, domains, email_addresses, email_headers, cleaned_text):
        self.urls = urls
        self.domains = domains
        self.email_addresses = email_addresses
        self.email_headers = email_headers
        self.cleaned_text = cleaned_text