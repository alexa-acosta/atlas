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

  async function submitOfferLetterScan(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "offer_letter");
    formData.append("source", file.name);

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
      const nextResults = [];
      const jobSource = submissions.jobPosting.url?.trim() || "pasted job description";
      const jobInput = submissions.jobPosting.url?.trim() || submissions.jobPosting.description?.trim();

      if (jobPostingReady && jobInput) {
        nextResults.push(await submitTextScan(jobInput, "job_post", jobSource));
      }

      if (recruiterEmailReady) {
        nextResults.push(
          await submitTextScan(
            submissions.recruiterEmail.trim(),
            "email",
            "pasted recruiter email"
          )
        );
      }

      if (offerLetterReady) {
        nextResults.push(await submitOfferLetterScan(submissions.offerLetterFile));
      }

      sessionStorage.setItem("latest_scan_results", JSON.stringify(nextResults));
      navigate("/results", { state: { scans: nextResults } });
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
