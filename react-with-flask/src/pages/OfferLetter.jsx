import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function OfferLetter() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(() => window._offerLetterFile ?? null);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  function handleFile(selected) {
    if (!selected || selected.type !== "application/pdf") return;
    setFile(selected);
    window._offerLetterFile = selected;
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleSave() {
    if (!file) return;
    sessionStorage.setItem("offer_letter_name", file.name);
    navigate("/scan");
  }

  function removeFile() {
    setFile(null);
    window._offerLetterFile = null;
    sessionStorage.removeItem("offer_letter_name");
    fileRef.current.value = "";
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
        style={{ maxWidth: 680, margin: "0 auto", padding: "8rem 2.5rem 4rem" }}
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
            Offer Letter
          </h1>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: 1.8,
              maxWidth: 520,
              marginBottom: "2.5rem",
            }}
          >
            Upload your offer letter as a PDF. We'll scan it for suspicious
            language, unusual terms, and other scam indicators.
          </p>

          {/* Drop zone */}
          <motion.div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileRef.current.click()}
            animate={{
              borderColor: dragOver ? "var(--teal-light)" : "var(--teal)",
              background: dragOver ? "rgba(21,107,117,0.08)" : "var(--bg-card)",
            }}
            style={{
              border: "1.5px dashed var(--teal)",
              borderRadius: "16px",
              padding: "3.5rem 2rem",
              textAlign: "center",
              cursor: file ? "default" : "pointer",
              transition: "all 0.2s",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📄</div>
            <p style={{ marginBottom: "0.4rem", fontWeight: 600 }}>
              {dragOver ? "Drop it here!" : "Drag & drop your PDF"}
            </p>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-dim)",
                marginBottom: "1.5rem",
              }}
            >
              or click to browse — PDF only
            </p>
            <button
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current.click();
              }}
              style={{ fontSize: "0.9rem" }}
            >
              browse file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </motion.div>

          {/* Attached file */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(21,107,117,0.08)",
                border: "1px solid var(--teal)",
                borderRadius: "10px",
                padding: "1rem 1.25rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    background: "#e76f51",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    padding: "0.25rem 0.4rem",
                    borderRadius: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  PDF
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  lineHeight: 1,
                  padding: "0.25rem",
                }}
              >
                ✕
              </button>
            </motion.div>
          )}

          <motion.button
            className="btn"
            onClick={handleSave}
            disabled={!file}
            animate={{ opacity: file ? 1 : 0.4 }}
            style={{ padding: "0.75rem 2.5rem", fontSize: "1rem" }}
          >
            save & return →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
