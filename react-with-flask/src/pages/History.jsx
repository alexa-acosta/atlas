// Updated History.jsx — with sort toggle
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { getScans } from "../utils/auth";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const verdictMap = {
  safe: { color: "#2a9d87", label: "Safe" },
  medium: { color: "#e9c46a", label: "Moderate" },
  high: { color: "#e76f51", label: "High Risk" },
};

function modeLabel(mode) {
  return mode === "job"
    ? "Job Posting"
    : mode === "email"
      ? "Recruiter Email"
      : mode === "offer"
        ? "Offer Letter"
        : mode;
}

const COLUMNS = [
  { key: "id", label: "id" },
  { key: "time", label: "time" },
  { key: "mode", label: "input type" },
  { key: "score", label: "score" },
  { key: "verdict", label: "analysis" },
];

function sortScans(scans, key, dir) {
  return [...scans].sort((a, b) => {
    let av, bv;
    if (key === "id") {
      av = a.id;
      bv = b.id;
    }
    if (key === "time") {
      av = new Date(a.timestamp);
      bv = new Date(b.timestamp);
    }
    if (key === "mode") {
      av = a.mode;
      bv = b.mode;
    }
    if (key === "score") {
      av = a.risk_score;
      bv = b.risk_score;
    }
    if (key === "verdict") {
      av = a.verdict;
      bv = b.verdict;
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortKey, setSortKey] = useState("time");
  const [sortDir, setSortDir] = useState("desc");
  const pdfRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError("");
      try {
        const data = await getScans();
        setScans(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = sortScans(scans, sortKey, sortDir);

  async function handleDownloadPDF() {
    const canvas = await html2canvas(pdfRef.current, {
      backgroundColor: "#092d31",
    });
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = 595.28;
    const imageHeight = (canvas.height * pageWidth) / canvas.width;
    const pdf = new jsPDF({ unit: "pt", format: [pageWidth, imageHeight] });
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imageHeight);
    pdf.save(`scan_result_${selectedScan.id}.pdf`);
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
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "8rem 2.5rem 4rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              marginBottom: "1rem",
              lineHeight: 1.1,
            }}
          >
            View Your History!
          </h1>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: 1.8,
              maxWidth: 520,
              marginBottom: "3rem",
              fontSize: "0.95rem",
            }}
          >
            Keep track of every scan in one place. Select any previous scan to
            view its full analysis.
          </p>

          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                color: "var(--text-dim)",
              }}
            >
              <div
                className="initiate-spinner"
                style={{ width: 20, height: 20 }}
              />
              <span>Loading scans...</span>
            </div>
          )}

          {error && (
            <p style={{ color: "#e76f51", fontSize: "0.85rem" }}>{error}</p>
          )}

          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--teal)" }}>
                    {COLUMNS.map((col) => {
                      const isActive = sortKey === col.key;
                      return (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          style={{
                            textAlign: "left",
                            padding: "0.9rem 1.25rem",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                            letterSpacing: "0.04em",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            cursor: "pointer",
                            userSelect: "none",
                            whiteSpace: "nowrap",
                            transition: "color 0.15s",
                          }}
                        >
                          {col.label}{" "}
                          <span
                            style={{
                              opacity: isActive ? 1 : 0.35,
                              fontSize: "1.5rem",
                            }}
                          >
                            {isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sorted.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "3rem 1.25rem",
                          textAlign: "center",
                          color: "var(--text-dim)",
                          background: "var(--bg-card)",
                        }}
                      >
                        No scans yet. Run your first scan to see results here.
                      </td>
                    </tr>
                  ) : (
                    sorted.map((scan, i) => {
                      const { color } =
                        verdictMap[scan.verdict] ?? verdictMap.safe;
                      return (
                        <motion.tr
                          key={scan.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setSelectedScan(scan)}
                          onMouseEnter={() => setHoveredRow(scan.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{
                            cursor: "pointer",
                            background:
                              hoveredRow === scan.id
                                ? "rgba(21,107,117,0.08)"
                                : i % 2 === 0
                                  ? "var(--bg-card)"
                                  : "var(--bg)",
                            transition: "background 0.15s",
                          }}
                        >
                          <td
                            style={{
                              padding: "0.9rem 1.25rem",
                              borderBottom: "1px solid var(--border)",
                              color: "var(--text-dim)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {scan.id}
                          </td>
                          <td
                            style={{
                              padding: "0.9rem 1.25rem",
                              borderBottom: "1px solid var(--border)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {new Date(scan.timestamp).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </td>
                          <td
                            style={{
                              padding: "0.9rem 1.25rem",
                              borderBottom: "1px solid var(--border)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {modeLabel(scan.mode)}
                          </td>
                          <td
                            style={{
                              padding: "0.9rem 1.25rem",
                              borderBottom: "1px solid var(--border)",
                              fontSize: "0.9rem",
                            }}
                          >
                            <span style={{ color, fontWeight: 600 }}>
                              {scan.risk_score}
                            </span>
                            <span style={{ color: "var(--text-dim)" }}>
                              /100
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "0.9rem 1.25rem",
                              borderBottom: "1px solid var(--border)",
                              fontSize: "0.9rem",
                            }}
                          >
                            <span
                              style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "999px",
                                background: `${color}22`,
                                color,
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              {verdictMap[scan.verdict]?.label ?? scan.verdict}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </motion.div>
          )}
        </motion.div>
      </div>
      {selectedScan && (
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
          onClick={() => setSelectedScan(null)}
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
              onClick={() => setSelectedScan(null)}
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

            <p
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                marginBottom: "0.5rem",
              }}
            >
              scan #{selectedScan.id} ·{" "}
              {new Date(selectedScan.timestamp).toLocaleString()}
            </p>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                marginBottom: "0.35rem",
              }}
            >
              {modeLabel(selectedScan.mode)}
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: verdictMap[selectedScan.verdict]?.color ?? "#2a9d87",
                  lineHeight: 1,
                }}
              >
                {selectedScan.risk_score}
              </span>
              <span style={{ color: "var(--text-dim)" }}>/100</span>
              <span
                style={{
                  marginLeft: "0.5rem",
                  fontWeight: 600,
                  color: verdictMap[selectedScan.verdict]?.color ?? "#2a9d87",
                }}
              >
                {verdictMap[selectedScan.verdict]?.label ??
                  selectedScan.verdict}
              </span>
            </div>

            <div
              style={{
                background: "var(--bg-input)",
                borderRadius: "999px",
                height: "6px",
                overflow: "hidden",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  width: `${selectedScan.risk_score}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background:
                    verdictMap[selectedScan.verdict]?.color ?? "#2a9d87",
                  transition: "width 0.8s ease",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                marginBottom: "0.75rem",
              }}
            >
              analysis
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginBottom: "2rem",
              }}
            >
              {selectedScan.indicators?.map((ind, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                    background: "#156b75",
                    borderRadius: "8px",
                    padding: "0.7rem 1rem",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      color:
                        verdictMap[selectedScan.verdict]?.color ?? "#2a9d87",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    ›
                  </span>
                  <span style={{ lineHeight: 1.6, fontSize: "0.88rem" }}>
                    {ind}
                  </span>
                </div>
              ))}
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                marginBottom: "0.5rem",
              }}
            >
              suggestion
            </p>
            <p
              style={{
                color: "var(--text-dim)",
                lineHeight: 1.7,
                fontSize: "0.9rem",
                marginBottom: "2rem",
              }}
            >
              {selectedScan.verdict === "safe"
                ? "This posting appears legitimate. Still proceed with caution."
                : selectedScan.verdict === "medium"
                  ? "Some suspicious signals detected. Verify before proceeding."
                  : selectedScan.verdict === "high"
                    ? "High risk! Do not provide personal information or click any links."
                    : ""}
            </p>

            <button
              onClick={handleDownloadPDF}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: "8px",
                padding: "0.55rem 1.25rem",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--teal-light)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              download PDF
            </button>
          </motion.div>
        </motion.div>
      )}
      {selectedScan && (
        <div
          ref={pdfRef}
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
            <span
              style={{
                color: verdictMap[selectedScan.verdict]?.color ?? "#2a9d87",
                fontWeight: 700,
              }}
            >
              {selectedScan.verdict?.toUpperCase()} — {selectedScan.risk_score}
              /100
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
            {selectedScan.indicators?.map((ind, i) => (
              <li key={i}>{ind}</li>
            ))}
          </ul>
          <h2 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>
            Full Analysis
          </h2>
          <p style={{ lineHeight: 2.2 }}>
            {selectedScan.summary || "No summary available."}
          </p>
        </div>
      )}
    </div>
  );
}
