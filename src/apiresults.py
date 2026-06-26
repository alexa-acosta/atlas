from __future__ import annotations

from dataclasses import dataclass, field

@dataclass
class APIResults:
    vt_result: dict = field(default_factory=dict)
    np_result: dict = field(default_factory=dict)
    cm_result: dict = field(default_factory=dict)
    gemini_text: str | None = None

    def get_vt(self) -> dict:
        return self.vt_result

    def get_np(self) -> dict:
        return self.np_result

    def get_cm(self) -> dict:
        return self.cm_result

    def to_string(self) -> str:
    # formats all API results into a single block for the Gemini prompt
    # Gemini's analyze_results() receives this as context
        sections = []

        if self.vt_result:
            sections.append("=== VirusTotal Results ===")
            attrs = (
                self.vt_result.get("data", {})
                               .get("attributes", {})
            )
            stats = attrs.get("last_analysis_stats", {})
            if stats:
                sections.append(
                    f"Malicious engines: {stats.get('malicious', 0)} / "
                    f"{sum(stats.values())}"
                )
                sections.append(
                    f"Suspicious engines: {stats.get('suspicious', 0)}"
                )
            reputation = attrs.get("reputation")
            if reputation is not None:
                sections.append(f"Reputation score: {reputation}")
            categories = attrs.get("categories", {})
            if categories:
                unique_cats = list(set(categories.values()))[:5]
                sections.append(f"Categories: {', '.join(unique_cats)}")

        if self.np_result:
            sections.append("\n=== Safe Browsing Results ===")
            threat = self.np_result.get("threat")
            matches = self.np_result.get("matches") or self.np_result.get("threatMatches")
            if threat:
                sections.append(f"Threat: {threat}")
            elif matches:
                sections.append(f"Threat matches: {matches}")
            else:
                sections.append("No threat data returned.")

        if self.cm_result:
            sections.append("\n=== Cloudmersive Results ===")
            clean       = self.cm_result.get("CleanResult")
            threat      = self.cm_result.get("ThreatScore")
            rationale   = self.cm_result.get("AnalysisRationale")
            url_results = self.cm_result.get("UrlAnalysis", [])

            if clean is not None:
                sections.append(f"Clean: {clean}")
            if threat is not None:
                sections.append(f"Threat score: {threat}/10")
            if rationale:
                sections.append(f"Rationale: {rationale}")
            if url_results:
                flagged = [u for u in url_results if not u.get("IsClean", True)]
                if flagged:
                    sections.append(
                        f"Flagged URLs: {len(flagged)} / {len(url_results)}"
                    )

        return "\n".join(sections) if sections else "No API results available."
