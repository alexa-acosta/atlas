from pathlib import Path

from src.apis.cloudmersive import CloudmersiveClient
from src.apis.gemini import Gemini
from src.apis.safebrowsing import SafeBrowsing
from src.apis.virustotal import VirusTotal
from src.apis.ipqualityscore import IPQualityScore
from src.apiresults import APIResults
from src.database import save_scan
from src.outputformatter import OutputFormatter
from src.parser import Parser
from src.scaninput import ScanInput
from src.scanresult import ScanResult
from src.scorer import Scorer
from src.textflattener import TextFlattener
from src.fetcher import fetch_url

class AtlasScanner:
    def __init__(self):
        self.text_flattener = TextFlattener()
        self.parser = Parser()
        self.virustotal = VirusTotal()
        self.safebrowsing = SafeBrowsing()
        self.cloudmersive = CloudmersiveClient()
        self.ipqs = IPQualityScore()
        self.gemini = Gemini()
        self.scorer = Scorer()
        self.output_formatter = OutputFormatter()

    def scan(self, raw_user_input: str, mode: str = "unknown", source: str = "", user_id: int | None = None) -> ScanResult:
        raw_user_input = self._prepare_raw_input(raw_user_input)
        flattened_input = self.text_flattener.flatten(raw_user_input)
        parsed_input = self.parser.parse(flattened_input)
        scan_input = ScanInput(raw_user_input, flattened_input, parsed_input)

        vt_result = self._scan_virustotal(scan_input)
        np_result = self._scan_safebrowsing(scan_input)
        cm_result = self._scan_cloudmersive(scan_input)
        ipqs_result = self._scan_ipqs(scan_input)

        api_results = APIResults(
            vt_result=vt_result,
            np_result=np_result,
            cm_result=cm_result,
            ipqs_result=ipqs_result
        )
        api_results.gemini_text = self.gemini.analyze_results(
            api_results,
            scan_input.flattened_user_input.cleaned_text
        )

        scan_result = self.scorer.calculate_score(api_results)
        scan_id = save_scan(
            scan_input.raw_user_input,
            scan_result.risk_score,
            scan_result.verdict,
            mode=mode,
            source=source,
            user_id=user_id
        )
        scan_result.scan_id = scan_id
        self.output_formatter.display(scan_result, mode=mode, source=source)
        return scan_result

    def _prepare_raw_input(self, raw_user_input: str) -> str:
        candidate = raw_user_input.strip()

        if candidate.startswith(("http://", "https://")):
            scraped = fetch_url(candidate)
            if not scraped:
                raise ValueError(f"Couldn't fetch content from: {raw_user_input}")
            return scraped

        if self._is_pdf_file(candidate):
            return self.text_flattener.extract_text_from_document(candidate)

        return raw_user_input

    def _is_pdf_file(self, raw_user_input: str) -> bool:
        if not raw_user_input or "\n" in raw_user_input or "\r" in raw_user_input:
            return False

        if len(raw_user_input) > 255:
            return False

        return Path(raw_user_input).is_file() and Path(raw_user_input).suffix.lower() == ".pdf"

    def _scan_virustotal(self, scan_input):
        parsed_input = scan_input.parsed_input

        if parsed_input.urls:
            result = self.virustotal.scan_url(parsed_input.urls[0])
            return result

        if parsed_input.domains:
            result = self.virustotal.scan_domain(parsed_input.domains[0])
            return result

        received_ips = parsed_input.email_headers.get("Received-IPs", [])
        if received_ips:
            result = self.virustotal.scan_ip(received_ips[0])
            return result

        return {}

    def _scan_safebrowsing(self, scan_input):
        parsed_input = scan_input.parsed_input

        if parsed_input.urls:
            result = self.safebrowsing.check_url(parsed_input.urls[0])
            return result

        return {}

    def _scan_cloudmersive(self, scan_input):
        result = self.cloudmersive.analyze_language(
            scan_input.flattened_user_input.cleaned_text
        )
        return result

    def _scan_ipqs(self, scan_input):
        parsed_input = scan_input.parsed_input
        sender_email = parsed_input.email_headers.get("From")

        if sender_email:
            result = self.ipqs.check_email(sender_email)
            return result
        return {}
