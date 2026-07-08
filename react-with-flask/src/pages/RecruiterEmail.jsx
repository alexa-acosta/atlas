import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function RecruiterEmail() {
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  function handleSave() {
    sessionStorage.setItem("email", content);
    navigate("/scan/confirm");
  }

  return (
    <div className="page">
      <Navbar loggedIn />
      <div className="page-content">
        <h1 className="page-title">Recruiter Email</h1>
        <p className="page-subtitle">
          Provide the recruiter's email by copying and pasting it below. For the
          best results, open the email, select the three dots, click "Show
          Original," and paste the original email content.
        </p>
        <p
          style={{
            marginBottom: "0.5rem",
            color: "var(--text-dim)",
            fontSize: "0.85rem",
          }}
        >
          content
        </p>
        <textarea
          className="input-dark"
          style={{ width: "100%", minHeight: "260px" }}
          placeholder="Paste email content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <a
        className="save-link"
        onClick={handleSave}
        style={{ cursor: "pointer" }}
      >
        save →
      </a>
    </div>
  );
}
