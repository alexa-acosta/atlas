from __future__ import annotations

from src.scanresult import ScanResult

R    = "\033[0m"
BOLD = "\033[1m"
DIM  = "\033[2m"
CYAN = "\033[96m"
GRN  = "\033[92m"
YEL  = "\033[93m"
RED  = "\033[91m"


class OutputFormatter:

    def display(self, result: ScanResult, mode: str = "unknown", source: str = ""):
        self._header(mode, source)
        self._score_bar(result.risk_score, result.verdict)
        self._indicators(result.indicators)
        self._summary(result.summary)
        self._footer(result.verdict)

    def _header(self, mode: str, source: str):
        label = {
            "email":        "Recruiter Email",
            "job_post":     "Job Posting",
            "offer_letter": "Offer Letter",
        }.get(mode, "Input")

        print(f"\n  {CYAN}{BOLD}── Scan Results: {label} ──{R}")
        if source:
            print(f"  {DIM}Source: {source}{R}")
        print()

    def _score_bar(self, score: int, verdict: str):
        color = self._verdict_color(verdict)
        filled  = int(score / 5)        # 20-char bar
        empty   = 20 - filled
        bar     = "█" * filled + "░" * empty

        print(f"  Risk Score   {color}{BOLD}{score:>3}/100{R}  {color}{bar}{R}")
        print(f"  Verdict      {color}{BOLD}{verdict.upper()}{R}\n")

    def _indicators(self, indicators: list[str]):
        if not indicators:
            return
        print(f"  {BOLD}Key Indicators{R}")
        for item in indicators:
            print(f"  {RED}▸{R} {item}")
        print()

    def _summary(self, summary: str):
        # strip the percentage line Gemini puts at the top and show score separately
        lines = [
            l for l in summary.splitlines()
            if not l.strip().endswith("likely fraudulent score")
            and not l.strip().endswith("likely fraudulent")
            and not l.strip().startswith("-")   # ← add this
            and not l.strip().startswith("•")   # ← and this
        ]
        clean = "\n".join(lines).strip()
        if not clean:
            return

        print(f"  {BOLD}Analysis{R}")
        for line in clean.splitlines():
            stripped = line.strip()
            if not stripped:
                continue
            # re-style bullet lines
            if stripped.startswith(("-", "•", "*")):
                body = stripped.lstrip("-•* ").strip()
                print(f"    {DIM}•{R} {body}")
            else:
                print(f"    {stripped}")
        print()

    def _footer(self, verdict: str):
        msgs = {
            "safe":   f"{GRN}This posting appears legitimate. Still proceed with caution.{R}",
            "medium": f"{YEL}Some suspicious signals detected. Verify before proceeding.{R}",
            "high":   f"{RED}High risk! Do not provide personal information or click any links.{R}",
        }
        print(f"  {msgs.get(verdict, '')}\n")
        print("  " + "─" * 54)

    def _verdict_color(self, verdict: str) -> str:
        return {"safe": GRN, "medium": YEL, "high": RED}.get(verdict, DIM)
