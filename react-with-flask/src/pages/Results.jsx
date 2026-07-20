import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function readSavedResult() {
  try {
    const savedResults = JSON.parse(sessionStorage.getItem("latest_scan_results") ?? "[]");
    return Array.isArray(savedResults) ? savedResults[0] : null;
  } catch {
    return null;
  }
}

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result ?? state?.scans?.[0] ?? readSavedResult();
  const [showDetails, setShowDetails] = useState(false);
  const resultRef = useRef(null);

  if (!result) return <Navigate to="/home" replace />;

  const verdictColor = { safe: "#2a9d87", medium: "#e9c46a", high: "#e76f51" };
  const color = verdictColor[result.verdict] ?? "#2a9d87";
  const barWidth = `${result.risk_score}%`;

  async function handleDownloadPDF() {
    const canvas = await html2canvas(resultRef.current, {
      backgroundColor: "#092d31",
    });
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = 595.28; // A4 width in points
    const imageHeight = (canvas.height * pageWidth) / canvas.width;
    const pdf = new jsPDF({ unit: "pt", format: [pageWidth, imageHeight] });
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imageHeight);
    pdf.save(`scan_result_${result.id}.pdf`);
  }

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
          <button className="btn-outline" onClick={handleDownloadPDF}>
            download PDF
          </button>
        </div>
      </div>
      {/* div styling for PDF generation */}
      <div 
      ref={resultRef}
      style={{ 
        position: "absolute",
        top: "0",
        left: "-9999px",
        width: "700px",
        padding: "2rem",
        backgroundColor: "#092d31",
        color: "var(--text)",
      }}>
        <h1 style={{ fontFamily: "var(--font-serif)", marginBottom: "0.75rem" }}> Analysis</h1>
        <p style={{ marginBottom: "0.75rem" }}>Score: <span style={{ color, fontWeight: 700 }}>
          {result.verdict?.toUpperCase()} - {result.risk_score}/100
        </span></p>
        <h1 style={{ marginBottom: "0.75rem" }}> Reasoning:</h1>
        <ul style={{ marginBottom: "2rem", paddingLeft: "1.25rem", lineHeight: 2.2 }}>
          {result.indicators?.length ? (
            result.indicators.map((ind, i) => <li key={i}>{ind}</li>)
          ) : (
            <li>No indicators available.</li>
          )}
        </ul>
        <h1 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>Full Analysis</h1>
        <p style={{ marginBottom: "0.75rem", lineHeight: 2.2 }}>{result.summary || "No summary available."}</p>
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
