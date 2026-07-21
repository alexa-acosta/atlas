import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getScans } from "../utils/auth";

export default function Navbar({ loggedIn = false }) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scanCount, setScanCount] = useState(null);
  const dropdownRef = useRef(null);

  const email = localStorage.getItem("userEmail") || null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (profileOpen && scanCount === null && loggedIn) {
      getScans()
        .then((data) => setScanCount(data.length))
        .catch(() => setScanCount(0));
    }
  }, [profileOpen]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setProfileOpen(false);
    navigate("/");
  }

  const isActive = (path) =>
    location.pathname === path
      ? { color: "var(--text)", fontWeight: "bold" }
      : { color: "var(--text-dim)" };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isScrolled ? "0.75rem 2.5rem" : "1.25rem 2.5rem",
        backdropFilter: "blur(12px)",
        background: isScrolled ? "rgba(9, 45, 49, 0.9)" : "transparent",
        borderBottom: isScrolled
          ? "1px solid var(--border)"
          : "1px solid transparent",
        transition: "all 0.3s ease",
        boxSizing: "border-box",
      }}
    >
      <Link
        to={loggedIn ? "/home" : "/"}
        style={{
          color: "var(--teal-light)",
          textShadow: "0 0 8px rgba(46,145,148,0.4)",
          fontFamily: "var(--font-serif)",
          fontSize: "1.3rem",
          fontWeight: 700,
          letterSpacing: "0.15em",
          textDecoration: "none",
        }}
      >
        ATLAS
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "7rem" }}>
        {loggedIn ? (
          <>
            <Link
              to="/home"
              style={{
                textDecoration: "none",
                fontSize: "0.9rem",
                fontFamily: "var(--font-mono)",
                ...isActive("/home"),
              }}
            >
              home
            </Link>
            <Link
              to="/about"
              state={{ loggedIn: true }}
              style={{
                textDecoration: "none",
                fontSize: "0.9rem",
                fontFamily: "var(--font-mono)",
                ...isActive("/about"),
              }}
            >
              about us
            </Link>
            <Link
              to="/scan"
              style={{
                textDecoration: "none",
                fontSize: "0.9rem",
                fontFamily: "var(--font-mono)",
                ...isActive("/scan"),
              }}
            >
              start a scan
            </Link>
            <Link
              to="/history"
              style={{
                textDecoration: "none",
                fontSize: "0.9rem",
                fontFamily: "var(--font-mono)",
                ...isActive("/history"),
              }}
            >
              history
            </Link>

            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                className="btn"
                onClick={() => setProfileOpen((o) => !o)}
                style={{ padding: "0.4rem 1.2rem", fontSize: "0.85rem" }}
              >
                profile
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.75rem)",
                      right: 0,
                      width: 240,
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "1.25rem",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                      zIndex: 200,
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "1rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "var(--text-dim)",
                          marginBottom: "0.4rem",
                        }}
                      >
                        signed in as
                      </p>
                      <p
                        style={{
                          fontSize: "0.88rem",
                          color: "var(--text)",
                          wordBreak: "break-all",
                          lineHeight: 1.4,
                        }}
                      >
                        {email ?? "—"}
                      </p>
                    </div>

                    <div
                      style={{
                        marginBottom: "1rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        scans completed
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "1.2rem",
                          color: "var(--teal-light)",
                        }}
                      >
                        {scanCount === null ? "…" : scanCount}
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        borderRadius: "8px",
                        padding: "0.5rem 1rem",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "border-color 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#e76f51";
                        e.currentTarget.style.color = "#e76f51";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text)";
                      }}
                    >
                      log out →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/"
              style={{
                textDecoration: "none",
                fontSize: "0.9rem",
                fontFamily: "var(--font-mono)",
                ...isActive("/"),
              }}
            >
              home
            </Link>
            <Link
              to="/about"
              state={{ loggedIn: false }}
              style={{
                textDecoration: "none",
                fontSize: "0.9rem",
                fontFamily: "var(--font-mono)",
                ...isActive("/about"),
              }}
            >
              about us
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button
                className="btn"
                style={{ padding: "0.4rem 1.2rem", fontSize: "0.85rem" }}
              >
                get started
              </button>
            </Link>
          </>
        )}
      </div>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text)",
          padding: "0.4rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </motion.nav>
  );
}
