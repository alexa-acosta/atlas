import re
from src.apiresults import APIResults
from src.scanresult import ScanResult


class Scorer:
    # weights sum to 1.0
    W_GEMINI = 0.55
    W_VIRUSTOTAL = 0.25
    W_CLOUDMERSIVE = 0.20

    def calculate_score(self, results: APIResults) -> ScanResult:
        vt_score = self._score_virustotal(results.vt_result)
        cm_score = self._score_cloudmersive(results.cm_result)
        gem_score = self._score_gemini(results.gemini_text)

        if gem_score is None:
            # average what we have
            available = [s for s in [vt_score, cm_score] if s is not None]
            final = int(sum(available) / len(available)) if available else 50
        else:
            vt = vt_score if vt_score is not None else gem_score
            cm = cm_score if cm_score is not None else gem_score
            final = int(
                self.W_GEMINI * gem_score +
                self.W_VIRUSTOTAL * vt +
                self.W_CLOUDMERSIVE * cm
            )

        verdict = self._verdict(final)
        indicators = self._extract_indicators(results.gemini_text)

        return ScanResult(
            risk_score=final,
            verdict=verdict,
            summary=results.gemini_text or "No analysis available.",
            indicators=indicators,
        )

    def _score_virustotal(self, vt: dict) -> int | None:
    # pull malicious + suspicious counts from VirusTotal's stats block
    # returns 0-100 proportional to flagged engines
        if not vt:
            return None
        try:
            stats = (
                vt.get('data', {})
                  .get('attributes', {})
                  .get('last_analysis_stats', {})
            )
            malicious   = stats.get('malicious', 0)
            suspicious  = stats.get('suspicious', 0)
            total       = sum(stats.values()) or 1
            ratio = (malicious + suspicious * 0.5) / total
            return min(100, int(ratio * 100 * 3))  
        except Exception:
            return None

    def _score_cloudmersive(self, cm: dict) -> int | None:
    # Cloudmersive returns CleanResult (bool) and ThreatScore (0-10)
        if not cm:
            return None
        try:
            threat = cm.get('ThreatScore', None)
            if threat is not None:
                return min(100, int(threat * 10))
            clean = cm.get('CleanResult', True)
            return 0 if clean else 80
        except Exception:
            return None

    def _score_gemini(self, text: str | None) -> int | None:
    # parses percentage from Gemini's output
        if not text:
            return None
        match = re.search(r'(\d{1,3})\s*%', text)
        if match:
            return min(100, int(match.group(1)))
        return None

    def _verdict(self, score: int) -> str:
        if score >= 65:
            return "high"
        if score >= 35:
            return "medium"
        return "safe"

    def _extract_indicators(self, text: str | None) -> list[str]:
    # pull the bullet points Gemini returns as the reasoning
        if not text:
            return []
        bullets = re.findall(r'^[-•]\s+(.+)', text, re.MULTILINE)
        return bullets[:3]  # cap at 3 per the Gemini prompt spec