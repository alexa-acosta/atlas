import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function JobPosting() {
  const [description, setDescription] = useState(() => {
    const saved = sessionStorage.getItem("job_post");
    if (!saved) return "";

    try {
      return JSON.parse(saved).description ?? "";
    } catch {
      return "";
    }
  });
  const [url, setUrl] = useState(() => {
    const saved = sessionStorage.getItem("job_post");
    if (!saved) return "";

    try {
      return JSON.parse(saved).url ?? "";
    } catch {
      return "";
    }
  });
  const navigate = useNavigate();
  const canSave = Boolean(description.trim() || url.trim());

  function handleSave() {
    if (!canSave) return;
    sessionStorage.setItem("job_post", JSON.stringify({ description, url }));
    navigate("/scan");
  }

  return (
    <div className="page">
      <Navbar loggedIn />
      <div className="page-content">
        <h1 className="page-title">Job Posting</h1>
        <p className="page-subtitle">
          Choose one of the following options to submit your job posting. Enter
          a URL or paste the job description below.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          <div>
            <p
              style={{
                marginBottom: "0.5rem",
                color: "var(--text-dim)",
                fontSize: "0.85rem",
              }}
            >
              description
            </p>
            <textarea
              className="input-dark"
              style={{ minHeight: "220px" }}
              placeholder="Paste job description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <p
              style={{
                marginBottom: "0.5rem",
                color: "var(--text-dim)",
                fontSize: "0.85rem",
              }}
            >
              URL
            </p>
            <textarea
              className="input-dark"
              style={{ minHeight: "220px" }}
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
      </div>
      {canSave && (
        <a
          className="save-link"
          onClick={handleSave}
          style={{ cursor: "pointer" }}
        >
          save →
        </a>
      )}
    </div>
  );
}
