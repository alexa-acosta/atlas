import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function RecruiterEmail() {
  const [content, setContent] = useState(
    () => sessionStorage.getItem("email") ?? "",
  );
  const navigate = useNavigate();
  const canSave = Boolean(content.trim());

  function handleSave() {
    if (!canSave) return;
    sessionStorage.setItem("email", content);
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
        style={{ maxWidth: 800, margin: "0 auto", padding: "8rem 2.5rem 4rem" }}
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
            Recruiter Email
          </h1>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: 1.8,
              maxWidth: 580,
              marginBottom: "0.75rem",
            }}
          >
            Copy and paste the email content below. For the best results, open
            the email, select the three dots, click{" "}
            <span style={{ color: "var(--teal-light)" }}>"Show Original,"</span>{" "}
            and paste that content here.
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
                minHeight: "320px",
                resize: "vertical",
                background: "transparent",
                border: "none",
                padding: 0,
                outline: "none",
              }}
              placeholder="Paste email content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
              {content.trim()
                ? `${content.trim().split(/\s+/).length} words`
                : "no content yet"}
            </span>
            <motion.button
              className="btn"
              onClick={handleSave}
              disabled={!canSave}
              animate={{ opacity: canSave ? 1 : 0.4 }}
              style={{ padding: "0.75rem 2.5rem", fontSize: "1rem" }}
            >
              save & return →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
