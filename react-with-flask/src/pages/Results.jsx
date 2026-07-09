import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return <Navigate to="/home" replace />;

  const verdictColor = { safe: "#2a9d87", medium: "#e9c46a", high: "#e76f51" };
  const color = verdictColor[result.verdict] ?? "#2a9d87";
  const barWidth = `${result.risk_score}%`;

  return (
    <div className="page">
      <Navbar loggedIn />
      <div className="page-content">
        <h1 className="page-title">Analysis</h1>

        <p
          style={{
            marginBottom: "0.75rem",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
          }}
        >
          Score:{" "}
          <span style={{ color, fontWeight: 700 }}>
            {result.verdict?.toUpperCase()}
          </span>
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "999px",
              height: "18px",
              width: "50%",
            }}
          >
            <div
              style={{
                background: color,
                width: barWidth,
                height: "100%",
                borderRadius: "999px",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
            {result.risk_score}/100
          </span>
        </div>

        <p style={{ fontFamily: "var(--font-mono)", marginBottom: "0.75rem" }}>
          Reasoning:
        </p>
        <ul
          style={{
            paddingLeft: "1.25rem",
            lineHeight: 2.2,
            marginBottom: "2rem",
          }}
        >
          {result.indicators?.length ? (
            result.indicators.map((ind, i) => <li key={i}>{ind}</li>)
          ) : (
            <li style={{ color: "var(--text-dim)" }}>
              No indicators available.
            </li>
          )}
        </ul>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn" onClick={() => setShowDetails(true)}>
            view details
          </button>
          <button className="btn-outline" onClick={() => navigate("/home")}>
            new scan
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowDetails(false)}
            >
              ✕
            </button>

            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.4rem",
                marginBottom: "0.25rem",
              }}
            >
              Scan Details
            </h3>
            <p
              style={{
                color: verdictColor[result.verdict],
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
                textTransform: "uppercase",
              }}
            >
              {result.verdict} — {result.risk_score}/100
            </p>

            {result.job_title && (
              <>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.05rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Job Title
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {result.job_title}
                </p>
              </>
            )}

            {result.location && (
              <>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.05rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Location
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {result.location}
                </p>
              </>
            )}

            {result.qualifications?.length > 0 && (
              <>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.05rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Qualifications
                </p>
                <ul
                  style={{
                    paddingLeft: "1.25rem",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    lineHeight: 2,
                    marginBottom: "1.25rem",
                  }}
                >
                  {result.qualifications.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </>
            )}

            {result.work_style && (
              <>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.05rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Work Style
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {result.work_style}
                </p>
              </>
            )}

            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.05rem",
                marginBottom: "0.5rem",
              }}
            >
              Full Analysis
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                lineHeight: 1.8,
                color: "var(--text-dim)",
              }}
            >
              {result.summary || "No summary available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
