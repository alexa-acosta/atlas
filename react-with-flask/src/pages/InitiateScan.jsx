import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

function readStoredSubmissions() {
  const savedJobPosting = sessionStorage.getItem("job_post");
  let jobPosting;
  try {
    jobPosting = savedJobPosting ? JSON.parse(savedJobPosting) : {};
  } catch {
    jobPosting = {};
  }

  return {
    jobPosting,
    recruiterEmail: sessionStorage.getItem("email") ?? "",
    offerLetterName: sessionStorage.getItem("offer_letter_name") ?? "",
    offerLetterFile: window._offerLetterFile ?? null,
  };
}

function clearStoredSubmissions() {
  sessionStorage.removeItem("job_post");
  sessionStorage.removeItem("email");
  sessionStorage.removeItem("offer_letter_name");
  window._offerLetterFile = null;
}

async function readApiResponse(response) {
  const rawBody = await response.text();
  if (!rawBody) {
    if (!response.ok)
      throw new Error(`Scan request failed with status ${response.status}.`);
    return {};
  }
  try {
    return JSON.parse(rawBody);
  } catch {
    if (!response.ok)
      throw new Error(`Scan request failed with status ${response.status}.`);
    throw new Error("The server returned an invalid response.");
  }
}

export default function InitiateScan() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState({
    jobPosting: { description: "", url: "" },
    recruiterEmail: "",
    offerLetterName: "",
    offerLetterFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function syncSubmissions() {
      setSubmissions(readStoredSubmissions());
    }
    syncSubmissions();
    window.addEventListener("focus", syncSubmissions);
    return () => window.removeEventListener("focus", syncSubmissions);
  }, []);

  const jobPostingReady = Boolean(
    submissions.jobPosting.description?.trim() ||
    submissions.jobPosting.url?.trim(),
  );
  const recruiterEmailReady = Boolean(submissions.recruiterEmail.trim());
  const offerLetterReady = Boolean(submissions.offerLetterFile);
  const savedCount = [
    jobPostingReady,
    recruiterEmailReady,
    offerLetterReady,
  ].filter(Boolean).length;

  function buildTextInput() {
    const sections = [];
    const jobDescription = submissions.jobPosting.description?.trim();
    const jobUrl = submissions.jobPosting.url?.trim();
    const recruiterEmail = submissions.recruiterEmail.trim();
    if (savedCount === 1 && jobUrl && !jobDescription) return jobUrl;
    if (jobDescription) sections.push(`=== Job Posting ===\n${jobDescription}`);
    else if (jobUrl) sections.push(`=== Job Posting URL ===\n${jobUrl}`);
    if (recruiterEmail)
      sections.push(`=== Recruiter Email ===\n${recruiterEmail}`);
    return sections.join("\n\n");
  }

  function getScanMode() {
    if (savedCount > 1) return "combined";
    if (jobPostingReady) return "job_post";
    if (recruiterEmailReady) return "email";
    if (offerLetterReady) return "offer_letter";
    return "unknown";
  }

  function getScanSource() {
    const sources = [];
    if (jobPostingReady)
      sources.push(
        submissions.jobPosting.url?.trim() || "pasted job description",
      );
    if (recruiterEmailReady) sources.push("pasted recruiter email");
    if (offerLetterReady) sources.push(submissions.offerLetterFile.name);
    return sources.join(", ");
  }

  function clearJobPosting() {
    sessionStorage.removeItem("job_post");
    setSubmissions((prev) => ({
      ...prev,
      jobPosting: { description: "", url: "" },
    }));
  }
  function clearRecruiterEmail() {
    sessionStorage.removeItem("email");
    setSubmissions((prev) => ({ ...prev, recruiterEmail: "" }));
  }
  function clearOfferLetter() {
    sessionStorage.removeItem("offer_letter_name");
    window._offerLetterFile = null;
    setSubmissions((prev) => ({
      ...prev,
      offerLetterName: "",
      offerLetterFile: null,
    }));
  }

  async function submitTextScan(rawInput, mode, source) {
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ raw_input: rawInput, mode, source }),
    });
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(data.error || "Unable to start scan.");
    return data.scan;
  }

  async function submitOfferLetterScan(file, rawInput, mode, source) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    formData.append("source", source);
    if (rawInput) formData.append("raw_input", rawInput);
    const response = await fetch("/api/scan", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await readApiResponse(response);
    if (!response.ok)
      throw new Error(data.error || "Unable to scan offer letter.");
    return data.scan;
  }

  async function handleStartScan() {
    if (!savedCount) {
      setError("Add at least one submission before starting a scan.");
      return;
    }
    if (submissions.offerLetterName && !submissions.offerLetterFile) {
      setError(
        "Your saved offer letter needs to be uploaded again before scanning.",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const textInput = buildTextInput();
      const mode = getScanMode();
      const source = getScanSource();
      const result = offerLetterReady
        ? await submitOfferLetterScan(
            submissions.offerLetterFile,
            textInput,
            mode,
            source,
          )
        : await submitTextScan(textInput, mode, source);
      sessionStorage.setItem("latest_scan_results", JSON.stringify([result]));
      clearStoredSubmissions();
      navigate("/results", { state: { result } });
    } catch (err) {
      setError(err.message || "Something went wrong while starting the scan.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Navbar loggedIn />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--text-dim)",
              fontSize: "1rem",
              letterSpacing: "0.08em",
            }}
          >
            analyzing...
          </p>
          <div className="initiate-spinner" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-mono)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.03,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, #000 1px, #000 2px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.05,
          backgroundImage:
            "linear-gradient(var(--teal) 1px, transparent 1px), linear-gradient(90deg, var(--teal) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          background: "rgba(21,107,117,0.08)",
          borderRadius: "50%",
          filter: "blur(120px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Navbar loggedIn />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "8rem 2.5rem 4rem",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
              marginBottom: "5rem",
              lineHeight: 0,
              textAlign: "center",
            }}
          >
            Ready to Scan?
          </h1>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: 0.8,
              maxWidth: 1000,
              marginBottom: "3.5rem",
              fontSize: "0.95rem",
            }}
          >
            You&apos;re almost ready. Confirm your submission below, then click{" "}
            <span style={{ color: "var(--text)" }}>Start Scan</span> to begin.
          </p>
          <div
            style={{
              display: "flex",
              gap: "4rem",
              flexWrap: "wrap",
              marginBottom: "4rem",
              justifyContent: "center",
            }}
          >
            <Chip
              label="job posting"
              ready={jobPostingReady}
              onClick={() => navigate("/scan/job")}
              onClear={clearJobPosting}
            />
            <Chip
              label="recruiter email"
              ready={recruiterEmailReady}
              onClick={() => navigate("/scan/email")}
              onClear={clearRecruiterEmail}
            />
            <Chip
              label="offer letter"
              ready={offerLetterReady}
              onClick={() => navigate("/scan/offer")}
              onClear={clearOfferLetter}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#e76f51",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <motion.button
              className="btn"
              onClick={handleStartScan}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "0.7rem 2.5rem",
                fontSize: "0.95rem",
                letterSpacing: "0.03em",
                boxShadow:
                  savedCount > 0 ? "0 0 24px rgba(21,107,117,0.35)" : "none",
                opacity: savedCount > 0 ? 1 : 0.5,
              }}
            >
              start scan
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Extracted chip component for clean repetition
function Chip({ label, ready, onClick, onClear }) {
  return (
    <motion.div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
      animate={{ scale: ready ? 1 : 1 }}
    >
      <button
        onClick={onClick}
        type="button"
        style={{
          padding: `0.6rem ${ready ? "2.75rem" : "1.5rem"} 0.6rem 1.5rem`,
          borderRadius: "999px",
          border: `1.5px solid ${ready ? "#4ade80" : "var(--border)"}`,
          background: ready ? "rgba(74, 222, 128, 0.15)" : "var(--bg-card)",
          color: ready ? "#4ade80" : "var(--text-dim)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.9rem",
          cursor: "pointer",
          letterSpacing: "0.03em",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!ready) {
            e.currentTarget.style.borderColor = "var(--teal)";
            e.currentTarget.style.color = "var(--text)";
          }
        }}
        onMouseLeave={(e) => {
          if (!ready) {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-dim)";
          }
        }}
      >
        {label}
      </button>

      {ready && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          type="button"
          title={`Remove ${label}`}
          style={{
            position: "absolute",
            right: "0.8rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#22c55e",
            opacity: 0.8,
            display: "flex",
            alignItems: "center",
            padding: 0,
            fontSize: "0.85rem",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}
