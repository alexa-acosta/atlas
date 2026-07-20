import { Link, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Navbar({ loggedIn = false }) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      {/* Logo */}
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

      {/* Links */}
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
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <button
                className="btn"
                style={{ padding: "0.4rem 1.2rem", fontSize: "0.85rem" }}
              >
                profile
              </button>
            </Link>
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

      {/* Theme toggle */}
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
