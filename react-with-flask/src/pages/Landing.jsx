import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1 className="page-title">
          Stay safe,
          <br />
          stay smart!
        </h1>
        <p className="page-subtitle">
          Navigate your job search with confidence. Atlas scans job-related
          communications for phishing, impersonation, and scam indicators so you
          can make informed decisions before sharing personal information.
        </p>
        <button className="btn" onClick={() => navigate("/login")}>
          get started
        </button>
      </div>
    </div>
  );
}
