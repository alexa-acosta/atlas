import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function OfferLetter() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  function handleFile(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    window._offerLetterFile = selected;
  }

  function handleSave() {
    if (!file) return;
    sessionStorage.setItem("offer_letter_name", file.name);
    navigate("/scan/confirm");
  }

  function removeFile() {
    setFile(null);
    window._offerLetterFile = null;
    sessionStorage.removeItem("offer_letter_name");
    fileRef.current.value = "";
  }

  return (
    <div className="page">
      <Navbar loggedIn />
      <div className="page-content">
        <h1 className="page-title">Offer Letter</h1>
        <p className="page-subtitle">
          Upload your offer letter by selecting a PDF (.pdf) file from your
          device.
        </p>

        {/* Drop zone */}
        <div className="card" style={{ maxWidth: "520px", marginTop: "1rem" }}>
          <div
            style={{
              border: "1.5px dashed var(--teal)",
              borderRadius: "8px",
              padding: "3rem 2rem",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => fileRef.current.click()}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⬆</div>
            <p style={{ marginBottom: "0.4rem" }}>Choose a file</p>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-dim)",
                marginBottom: "1rem",
              }}
            >
              PDF format only
            </p>
            <button
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current.click();
              }}
            >
              browse file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handleFile}
            />
          </div>

          {/* Attached file display */}
          {file && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1rem",
                background: "var(--bg-input)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    background: "#e76f51",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    padding: "0.2rem 0.35rem",
                    borderRadius: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  PDF
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem" }}>{file.name}</p>
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
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* save only active once file is attached */}
      {file && (
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
