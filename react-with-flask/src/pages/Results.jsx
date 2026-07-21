import { useState, useRef } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

const verdictMap = {
  safe: { color: "#2a9d87", label: "SAFE" },
  medium: { color: "#e9c46a", label: "MODERATE RISK" },
  high: { color: "#e76f51", label: "HIGH RISK" },
};

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result ?? state?.scans?.[0] ?? readSavedResult();
  const [showDetails, setShowDetails] = useState(false);
  const resultRef = useRef(null);

  if (!result) return <Navigate to="/home" replace />;

  const { color, label } = verdictMap[result.verdict] ?? verdictMap.safe;

  async function handleDownloadPDF() {
    const canvas = await html2canvas(resultRef.current, {
      backgroundColor: "#092d31",
    });
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = 595.28;
    const imageHeight = (canvas.height * pageWidth) / canvas.width;
    const pdf = new jsPDF({ unit: "pt", format: [pageWidth, imageHeight] });
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imageHeight);
    pdf.save(`scan_result_${result.id}.pdf`);
  }

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
        style={{ maxWidth: 780, margin: "0 auto", padding: "8rem 2.5rem 5rem" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              marginBottom: "1.25rem",
              lineHeight: 1.1,
            }}
          >
            Analysis
          </h1>

          <p
            style={{
              fontSize: "0.95rem",
              marginBottom: "0.75rem",
              letterSpacing: "0.02em",
            }}
          >
            Score: <span style={{ color, fontWeight: 700 }}>{label}</span>
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
                flex: 1,
                background: "var(--bg-card)",
                borderRadius: "999px",
                height: "16px",
                overflow: "hidden",
                maxWidth: 340,
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.risk_score}%` }}
                transition={{
                  duration: 1.1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.2,
                }}
                style={{
                  height: "100%",
                  borderRadius: "999px",
                  background: color,
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.9rem",
                color: "var(--text-dim)",
                whiteSpace: "nowrap",
              }}
            >
              {result.risk_score}/100
            </span>
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              marginBottom: "0.75rem",
              color: "var(--text-dim)",
            }}
          >
            Reasoning:
          </p>
          <ul
            style={{
              paddingLeft: "1.25rem",
              marginBottom: "3rem",
              lineHeight: 0,
            }}
          >
            {result.indicators?.length ? (
              result.indicators.map((ind, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  style={{
                    lineHeight: 1.75,
                    marginBottom: "0.75rem",
                    fontSize: "0.9rem",
                    color: "var(--text)",
                  }}
                >
                  {ind}
                </motion.li>
              ))
            ) : (
              <li style={{ color: "var(--text-dim)" }}>
                No indicators available.
              </li>
            )}
          </ul>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              className="btn"
              onClick={() => setShowDetails(true)}
              style={{ fontSize: "0.9rem" }}
            >
              view job details
            </button>
            <button
              onClick={() => navigate("/scan")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                color: "var(--text-dim)",
                padding: 0,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-dim)")
              }
            >
              new scan
            </button>
            <button
              onClick={handleDownloadPDF}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                color: "var(--text-dim)",
                padding: 0,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-dim)")
              }
            >
              download PDF
            </button>
          </div>
        </motion.div>
      </div>

      <div
        ref={resultRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "700px",
          padding: "2rem",
          backgroundColor: "#092d31",
          color: "#e8f0ee",
        }}
      >
        <h1
          style={{ fontFamily: "var(--font-serif)", marginBottom: "0.75rem" }}
        >
          Analysis
        </h1>
        <p style={{ marginBottom: "0.75rem" }}>
          Score:{" "}
          <span style={{ color, fontWeight: 700 }}>
            {label} — {result.risk_score}/100
          </span>
        </p>
        <h2 style={{ marginBottom: "0.75rem" }}>Reasoning:</h2>
        <ul
          style={{
            marginBottom: "2rem",
            paddingLeft: "1.25rem",
            lineHeight: 2.2,
          }}
        >
          {result.indicators?.length ? (
            result.indicators.map((ind, i) => <li key={i}>{ind}</li>)
          ) : (
            <li>No indicators available.</li>
          )}
        </ul>
        <h2 style={{ marginBottom: "0.75rem" }}>Full Analysis</h2>
        <p style={{ lineHeight: 2.2 }}>
          {result.summary || "No summary available."}
        </p>
      </div>

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
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "2.5rem",
              maxWidth: 540,
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
                marginBottom: "0.35rem",
              }}
            >
              Job Details
            </h3>
            <p
              style={{
                color,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "2rem",
              }}
            >
              {label} — {result.risk_score}/100
            </p>

            {[
              { label: "Job Title", value: result.job_title },
              { label: "Location", value: result.location },
              { label: "Work Style", value: result.work_style },
            ]
              .filter((f) => f.value)
              .map(({ label: fieldLabel, value }) => (
                <div key={fieldLabel} style={{ marginBottom: "1.5rem" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1rem",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {fieldLabel}
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
