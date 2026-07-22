import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { login } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      localStorage.setItem("isLoggedIn", "true");
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
          padding: "8rem 1rem 4rem",
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
            Welcome to Atlas!
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
            style={{ marginTop: "0.4rem", marginBottom: "1.5rem" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "logging in..." : "Login"}
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: "1rem 0",
            }}
          >
            <hr style={{ flex: 1, borderColor: "#ffff" }} />
            <span style={{ color: "#ffff", fontSize: "0.85rem" }}>or</span>
            <hr style={{ flex: 1, borderColor: "#ffff" }} />
          </div>
          <button
            className="login-btn"
            style={{ width: "100%", borderRadius: "8px", padding: "0.85rem" }}
            onClick={() => navigate("/signup")}
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}
