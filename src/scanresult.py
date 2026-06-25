from dataclasses import dataclass, field

@dataclass
class ScanResult:
    risk_score: int
    verdict: str          # "low" | "medium" | "high"
    summary: str
    indicators: list[str] = field(default_factory=list)

    def get_risk_score(self) -> int:
        return self.risk_score

    def get_verdict(self) -> str:
        return self.verdict

    def get_summary(self) -> str:
        return self.summary

    def get_indicators(self) -> list[str]:
        return self.indicators

    def is_high_risk(self) -> bool:
        return self.verdict == "high"