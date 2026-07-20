import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

function readSavedResult() {
  try {
    const saved = JSON.parse(
      sessionStorage.getItem("latest_scan_results") ?? "[]",
    );
    return Array.isArray(saved) ? saved[0] : null;
  } catch {
    return null;
  }
}

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result ?? state?.scans?.[0] ?? readSavedResult();
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return <Navigate to="/home" replace />;

  const verdictMap = {
    safe: { color: "#2a9d87", label: "Safe" },
    medium: { color: "#e9c46a", label: "Moderate Risk" },
    high: { color: "#e76f51", label: "High Risk" },
  };
  const { color, label } = verdictMap[result.verdict] ?? verdictMap.safe;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-mono)",
      }}
    >
      <Navbar loggedIn />

      <div
        style={{ maxWidth: 800, margin: "0 auto", padding: "8rem 2.5rem 4rem" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Score card */}
          <div
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${color}33`,
              borderRadius: "16px",
              padding: "2rem 2.5rem",
              marginBottom: "2rem",
              boxShadow: `0 0 30px ${color}1a`,
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                marginBottom: "0.75rem",
              }}
            >
              risk assessment
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "4rem",
                  fontWeight: 700,
                  color,
                  lineHeight: 1,
                }}
              >
                {result.risk_score}
              </span>
              <span style={{ color: "var(--text-dim)", fontSize: "1rem" }}>
                /100
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color,
                }}
              >
                {label}
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                background: "var(--bg-input)",
                borderRadius: "999px",
                height: "8px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.risk_score}%` }}
                transition={{
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.3,
                }}
                style={{
                  height: "100%",
                  borderRadius: "999px",
                  background: `linear-gradient(90deg, ${color}88, ${color})`,
                }}
              />
            </div>
          </div>

          {/* Indicators */}
          <div style={{ marginBottom: "2rem" }}>
            <p
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                marginBottom: "1rem",
              }}
            >
              reasoning
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {result.indicators?.length ? (
                result.indicators.map((ind, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                      background: "var(--bg-card)",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{ color: color, marginTop: "1px", flexShrink: 0 }}
                    >
                      ›
                    </span>
                    <span style={{ lineHeight: 1.6, fontSize: "0.9rem" }}>
                      {ind}
                    </span>
                  </motion.div>
                ))
              ) : (
                <p style={{ color: "var(--text-dim)" }}>
                  No indicators available.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn" onClick={() => setShowDetails(true)}>
              view details
            </button>
            <button
              onClick={() => navigate("/scan")}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: "8px",
                padding: "0.6rem 1.5rem",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--teal-light)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              new scan
            </button>
          </div>
        </motion.div>
      </div>

      {/* Details modal */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "2.5rem",
              maxWidth: 560,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowDetails(false)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "none",
                border: "none",
                color: "var(--text-dim)",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ✕
            </button>

            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                marginBottom: "0.4rem",
              }}
            >
              Scan Details
            </h3>
            <p
              style={{
                color,
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                marginBottom: "2rem",
                textTransform: "uppercase",
              }}
            >
              {result.verdict} — {result.risk_score}/100
            </p>

            {[
              { label: "Job Title", value: result.job_title },
              { label: "Location", value: result.location },
              { label: "Work Style", value: result.work_style },
            ]
              .filter((f) => f.value)
              .map(({ label, value }) => (
                <div key={label} style={{ marginBottom: "1.5rem" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                    {value}
                  </p>
                </div>
              ))}

            {result.qualifications?.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Qualifications
                </p>
                <ul
                  style={{
                    paddingLeft: "1.25rem",
                    color: "var(--text-dim)",
                    fontSize: "0.9rem",
                    lineHeight: 2,
                  }}
                >
                  {result.qualifications.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                Full Analysis
              </p>
              <p
                style={{
                  color: "var(--text-dim)",
                  fontSize: "0.85rem",
                  lineHeight: 1.8,
                }}
              >
                {result.summary || "No summary available."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
