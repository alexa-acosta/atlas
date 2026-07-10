import { useState, useEffect} from "react";
// import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getScans } from "../utils/auth";

export default function History() {
  // const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);

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

  return (
    <div className="page">
      <Navbar loggedIn />
      <div className="page-content">
        <h1 className="page-title">View Your History!</h1>
        <p className="page-subtitle">
          Keep track of every scan in one place. Select any previous scan to view its full analysis.
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
              <h2 style={{ fontFamily: "var(--font-mono)", marginBottom: "0.5rem" }}>
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
            <p style={{ marginBottom: "1.25rem" }}>{selectedScan.risk_score}/100</p>

            <h2 style={{ fontFamily: "var(--font-mono)" }}>
              Analysis
            </h2>
            <ul style={{ marginBottom: "1.25rem" , marginLeft: "1.25rem", marginTop: "1rem" }}>
              {selectedScan.indicators.map((indicator, index) => (
                <li key={index} style={{ marginBottom: "1rem"}}>{indicator}</li>
              ))}
          </ul>

            <h2 style={{ fontFamily: "var(--font-mono)", marginBottom: "0.5rem" }}>
              Suggestions
            </h2>
            
            <p style={{ marginBottom: "1.25rem" }}>
              {selectedScan.verdict === "safe"
              ? "This posting appears legitimate. Still proceed with caution."
            : selectedScan.verdict === "medium"
              ? "Some suspicious signals detected. Verify before proceeding."
            : selectedScan.verdict === "high"
              ? "High risk! Do not provide personal information or click any links."
            : ""}
            </p>
            </div>
          </div>
        )}
      </div>
      


  );
}
