import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { getScans } from "../utils/auth";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function History() {
  // const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);
  const pdfRef = useRef(null);
  const verdictColor = { safe: "#2a9d87", medium: "#e9c46a", high: "#e76f51" };

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const scans = await getScans();
      setScans(scans);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleDownloadPDF() {
    const canvas = await html2canvas(pdfRef.current, {
      backgroundColor: "#092d31",
    });
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = 595.28; // A4 width in points
    const imageHeight = (canvas.height * pageWidth) / canvas.width;
    const pdf = new jsPDF({ unit: "pt", format: [pageWidth, imageHeight] });
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imageHeight);
    pdf.save(`scan_result_${selectedScan.id}.pdf`);
  }

  return (
    <div className="page">
      <Navbar loggedIn />
      <div className="page-content">
        <h1 className="page-title">View Your History!</h1>
        <p className="page-subtitle">
          Keep track of every scan in one place. Select any previous scan to
          view its full analysis.
        </p>
        {loading && <p style={{ color: "var(--text-dim)" }}>Loading...</p>}

        {error && (
          <p
            style={{
              color: "#e76f51",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </p>
        )}
        {!loading && !error && (
          <div style={{ borderRadius: "12px", overflow: "hidden" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: "var(--teal-light)",
                    }}
                  >
                    id
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: "var(--teal-light)",
                    }}
                  >
                    time
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: "var(--teal-light)",
                    }}
                  >
                    input type
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: "var(--teal-light)",
                    }}
                  >
                    score
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: "var(--teal-light)",
                    }}
                  >
                    analysis
                  </th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    style={{ cursor: "pointer" }}
                  >
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: "var(--teal)",
                      }}
                    >
                      {scan.id}
                    </td>

                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: "var(--teal)",
                      }}
                    >
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: "var(--teal)",
                      }}
                    >
                      {scan.mode === "job"
                        ? "Job Posting"
                        : scan.mode === "email"
                          ? "Recruiter Email"
                          : scan.mode === "offer"
                            ? "Offer Letter"
                            : scan.mode}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: "var(--teal)",
                      }}
                    >
                      {scan.risk_score}/100
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: "var(--teal)",
                      }}
                    >
                      {scan.verdict}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedScan && (
        <div className="modal-overlay" onClick={() => setSelectedScan(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedScan(null)}
            >
              x
            </button>
            <button
              className="btn-outline"
              onClick={handleDownloadPDF}
              style={{
                position: "absolute",
                bottom: "0.5rem",
                right: "1.25rem",
                padding: "0.5rem",
                margin: "0.5rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              download PDF
            </button>
            <h2
              style={{ fontFamily: "var(--font-mono)", marginBottom: "0.5rem" }}
            >
              Scan {selectedScan.id}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              {new Date(selectedScan.timestamp).toLocaleString()}
            </p>
            <h2 style={{ marginBottom: "0.5rem" }}>
              {selectedScan.mode === "job"
                ? "Job Posting"
                : selectedScan.mode === "email"
                  ? "Recruiter Email"
                  : selectedScan.mode === "offer"
                    ? "Offer Letter"
                    : selectedScan.mode}
            </h2>
            <p style={{ marginBottom: "1.25rem" }}>
              {selectedScan.risk_score}/100
            </p>

            <h2 style={{ fontFamily: "var(--font-mono)" }}>Analysis</h2>
            <ul
              style={{
                marginBottom: "1.25rem",
                marginLeft: "1.25rem",
                marginTop: "1rem",
              }}
            >
              {selectedScan.indicators.map((indicator, index) => (
                <li key={index} style={{ marginBottom: "1rem" }}>
                  {indicator}
                </li>
              ))}
            </ul>

            <h2
              style={{ fontFamily: "var(--font-mono)", marginBottom: "0.5rem" }}
            >
              Suggestions
            </h2>

            <p style={{ marginBottom: "2rem" }}>
              {selectedScan.verdict === "safe"
                ? "This posting appears legitimate. Still proceed with caution."
                : selectedScan.verdict === "medium"
                  ? "Some suspicious signals detected. Verify before proceeding."
                  : selectedScan.verdict === "high"
                    ? "High risk! Do not provide personal information or click any links."
                    : ""}
            </p>
          </div>
          {/* pdf styling matching results.jsx */}
          <div
            ref={pdfRef}
            style={{
              position: "absolute",
              left: "-9999px",
              top: 0,
              width: "700px",
              padding: "2rem",
              backgroundColor: "#092d31",
              color: "var(--text)",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                marginBottom: "0.75rem",
              }}
            >
              Analysis
            </h1>
            <p style={{ marginBottom: "0.75rem" }}>
              Score:{" "}
              <span
                style={{
                  color: verdictColor[selectedScan.verdict] ?? "#2a9d87",
                  fontWeight: 700,
                }}
              >
                {selectedScan.verdict?.toUpperCase()} -{" "}
                {selectedScan.risk_score}/100
              </span>
            </p>
            <h1 style={{ marginBottom: "0.75rem" }}>Reasoning:</h1>
            <ul
              style={{
                marginBottom: "2rem",
                paddingLeft: "1.25rem",
                lineHeight: 2.2,
              }}
            >
              {selectedScan.indicators?.length ? (
                selectedScan.indicators.map((ind, i) => <li key={i}>{ind}</li>)
              ) : (
                <li>No indicators available.</li>
              )}
            </ul>
            <h1 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>
              Full Analysis
            </h1>
            <p style={{ marginBottom: "0.75rem", lineHeight: 2.2 }}>
              {selectedScan.summary || "No summary available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
