import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <Navbar loggedIn />
      <div className="page-content">
        <h1 className="page-title">Start a Scan!</h1>
        <p className="page-subtitle">
          Choose what you'd like to analyze by uploading or pasting a job
          posting, recruiter email, or offer letter. We'll evaluate the content
          for suspicious patterns, scam warning signs, and other indicators of
          fraudulent recruitment.
        </p>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <button className="btn" onClick={() => navigate("/scan/job")}>
            job posting
          </button>
          <button className="btn" onClick={() => navigate("/scan/email")}>
            recruiter email
          </button>
          <button className="btn" onClick={() => navigate("/scan/offer")}>
            offer letter
          </button>
        </div>
      </div>
    </div>
  );
}
