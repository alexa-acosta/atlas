import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { signup } from "../utils/auth";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignup() {
    if (!email || !password) {
      setError("All fields required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signup(email, password);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "4rem 1rem",
        }}
      >
        <div className="card" style={{ width: "100%", maxWidth: "480px" }}>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "1.75rem",
              fontFamily: "var(--font-mono)",
            }}
          >
            Sign Up Here!
          </h2>
          <label style={{ fontSize: "0.85rem" }}>Email</label>
          <input
            className="input-dark"
            style={{ marginTop: "0.4rem", marginBottom: "1.25rem" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label style={{ fontSize: "0.85rem" }}>Password</label>
          <input
            type="password"
            className="input-dark"
            style={{ marginTop: "0.4rem", marginBottom: "1.25rem" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label style={{ fontSize: "0.85rem" }}>Confirm Password</label>
          <input
            type="password"
            className="input-dark"
            style={{ marginTop: "0.4rem", marginBottom: "1.5rem" }}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && (
            <p
              style={{
                color: "#e76f51",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {error}
            </p>
          )}
          <button
            className="login-btn"
            style={{ width: "100%", borderRadius: "8px", padding: "0.85rem" }}
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "creating account..." : "Sign Up"}
          </button>
          <p
            style={{
              textAlign: "center",
              marginTop: "1.25rem",
              fontSize: "0.85rem",
              color: "var(--text-dim)",
            }}
          >
            Already have an account?{" "}
            <span
              style={{
                color: "var(--text)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
