import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const routedResults = location.state?.scans;

    if (Array.isArray(routedResults) && routedResults.length) {
      setResults(routedResults);
      return;
    }

    try {
      const savedResults = JSON.parse(sessionStorage.getItem("latest_scan_results") ?? "[]");
      setResults(Array.isArray(savedResults) ? savedResults : []);
    } catch {
      setResults([]);
    }
  }, [location.state]);

  return (
    <div className="page">
      <Navbar loggedIn />
      <div className="page-content">
        <h1 className="page-title">Scan Results</h1>
        <p className="page-subtitle">
          Review the latest scan output below. Each submitted section is listed separately so
          you can compare the signals that were found across the job posting, recruiter email,
          and offer letter.
        </p>

        {!results.length ? (
          <div className="card results-empty">
            <p>No scan results are available yet.</p>
            <button className="btn" type="button" onClick={() => navigate("/scan")}>
              back to initiate scan
            </button>
          </div>
        ) : (
          <div className="results-grid">
            {results.map((scan, index) => (
              <div className="card results-card" key={`${scan.mode}-${scan.id ?? index}`}>
                <div className="results-meta">
                  <span className="results-mode">{scan.mode.replaceAll("_", " ")}</span>
                  <span className={`results-verdict verdict-${scan.verdict}`}>
                    {scan.verdict}
                  </span>
                </div>
                <h2 className="results-score">{scan.risk_score}/100</h2>
                <p className="results-source">{scan.source || "submitted content"}</p>
                <p className="results-summary">{scan.summary}</p>
                {Array.isArray(scan.indicators) && scan.indicators.length > 0 && (
                  <ul className="results-indicators">
                    {scan.indicators.map((indicator, indicatorIndex) => (
                      <li key={`${scan.mode}-${indicatorIndex}`}>{indicator}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
