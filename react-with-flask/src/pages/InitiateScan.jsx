import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function readStoredSubmissions() {
  const savedJobPosting = sessionStorage.getItem("job_post");
  let jobPosting;

  try {
    jobPosting = savedJobPosting ? JSON.parse(savedJobPosting) : {};
  } catch {
    jobPosting = {};
  }

  const recruiterEmail = sessionStorage.getItem("email") ?? "";
  const offerLetterName = sessionStorage.getItem("offer_letter_name") ?? "";
  const offerLetterFile = window._offerLetterFile ?? null;

  return {
    jobPosting,
    recruiterEmail,
    offerLetterName,
    offerLetterFile,
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
    if (!response.ok) {
      throw new Error(`Scan request failed with status ${response.status}.`);
    }

    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    if (!response.ok) {
      throw new Error(`Scan request failed with status ${response.status}.`);
    }

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
    submissions.jobPosting.description?.trim() || submissions.jobPosting.url?.trim()
  );
  const recruiterEmailReady = Boolean(submissions.recruiterEmail.trim());
  const offerLetterReady = Boolean(submissions.offerLetterFile);
  const savedCount = [jobPostingReady, recruiterEmailReady, offerLetterReady].filter(Boolean).length;

  function buildTextInput() {
    const sections = [];
    const jobDescription = submissions.jobPosting.description?.trim();
    const jobUrl = submissions.jobPosting.url?.trim();
    const recruiterEmail = submissions.recruiterEmail.trim();

    if (savedCount === 1 && jobUrl && !jobDescription) {
      return jobUrl;
    }

    if (jobDescription) {
      sections.push(`=== Job Posting ===\n${jobDescription}`);
    } else if (jobUrl) {
      sections.push(`=== Job Posting URL ===\n${jobUrl}`);
    }

    if (recruiterEmail) {
      sections.push(`=== Recruiter Email ===\n${recruiterEmail}`);
    }

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

    if (jobPostingReady) {
      sources.push(submissions.jobPosting.url?.trim() || "pasted job description");
    }
    if (recruiterEmailReady) sources.push("pasted recruiter email");
    if (offerLetterReady) sources.push(submissions.offerLetterFile.name);

    return sources.join(", ");
  }

  async function submitTextScan(rawInput, mode, source) {
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        raw_input: rawInput,
        mode,
        source,
      }),
    });

    const data = await readApiResponse(response);

    if (!response.ok) {
      throw new Error(data.error || "Unable to start scan.");
    }

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

    if (!response.ok) {
      throw new Error(data.error || "Unable to scan offer letter.");
    }

    return data.scan;
  }

  async function handleStartScan() {
    if (!savedCount) {
      setError("Add at least one submission before starting a scan.");
      return;
    }

    if (submissions.offerLetterName && !submissions.offerLetterFile) {
      setError("Your saved offer letter needs to be uploaded again before scanning.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const textInput = buildTextInput();
      const mode = getScanMode();
      const source = getScanSource();
      const result = offerLetterReady
        ? await submitOfferLetterScan(submissions.offerLetterFile, textInput, mode, source)
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
      <div className="page">
        <Navbar loggedIn />
        <div className="page-content initiate-loading-shell">
          <div className="initiate-loading-copy">loading...</div>
          <div className="initiate-spinner" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar loggedIn />
      <div className="page-content initiate-shell">
        <div className="initiate-panel">
          <div className="initiate-copy">
            <p className="initiate-eyebrow">scan queue</p>
            <h1 className="page-title">Ready to Scan?</h1>
            <p className="page-subtitle">
              You&apos;re almost ready. Confirm what you&apos;ve already submitted, add any
              remaining sections, and start the scan when everything you want included is
              marked complete.
            </p>
          </div>

          <div className="initiate-progress">
            <span>{savedCount} of 3 ready</span>
            {submissions.offerLetterName && !offerLetterReady && (
              <span>offer letter must be re-uploaded before scanning</span>
            )}
          </div>

          <div className="initiate-actions">
            <button
              className={`initiate-chip ${jobPostingReady ? "is-complete" : ""}`}
              onClick={() => navigate("/scan/job")}
              type="button"
            >
              job posting
            </button>
            <button
              className={`initiate-chip ${recruiterEmailReady ? "is-complete" : ""}`}
              onClick={() => navigate("/scan/email")}
              type="button"
            >
              recruiter email
            </button>
            <button
              className={`initiate-chip ${offerLetterReady ? "is-complete" : ""}`}
              onClick={() => navigate("/scan/offer")}
              type="button"
            >
              offer letter
            </button>
          </div>

          {error && <p className="initiate-error">{error}</p>}

          <button
            className="btn initiate-start"
            onClick={handleStartScan}
            type="button"
          >
            start scan
          </button>
        </div>
      </div>
    </div>
  );
}
