import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function JobPosting() {
  const [description, setDescription] = useState(() => {
    const saved = sessionStorage.getItem("job_post");
    try {
      return JSON.parse(saved).description ?? "";
    } catch {
      return "";
    }
  });
  const [url, setUrl] = useState(() => {
    const saved = sessionStorage.getItem("job_post");
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
          maxWidth: 1100,
          margin: "0 auto",
          padding: "8rem 2.5rem 4rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate("/scan")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-dim)",
              fontSize: "0.85rem",
              padding: 0,
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            ← back to scan queue
          </button>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              marginBottom: "1rem",
              lineHeight: 1.1,
            }}
          >
            Job Posting
          </h1>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: 1.8,
              maxWidth: 580,
              marginBottom: "3rem",
            }}
          >
            Provide a URL or paste the job description directly. You only need
            one — if you have both, we'll use both for a more thorough analysis.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
              marginBottom: "2.5rem",
            }}
          >
            <div>
              <p
                style={{
                  marginBottom: "0.6rem",
                  color: "var(--text-dim)",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                description
              </p>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  marginBottom: "2rem",
                }}
              >
                <textarea
                  className="input-dark"
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    resize: "vertical",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    outline: "none",
                  }}
                  placeholder="Paste job description here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div>
              <p
                style={{
                  marginBottom: "0.6rem",
                  color: "var(--text-dim)",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                URL
              </p>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  marginBottom: "2rem",
                }}
              >
                <textarea
                  className="input-dark"
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    resize: "vertical",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    outline: "none",
                  }}
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <motion.button
            className="btn"
            onClick={handleSave}
            disabled={!canSave}
            animate={{ opacity: canSave ? 1 : 0.4 }}
            style={{ padding: "0.75rem 2.5rem", fontSize: "1rem" }}
          >
            save & return →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
