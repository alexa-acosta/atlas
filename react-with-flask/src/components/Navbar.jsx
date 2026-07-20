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

  return (
    <nav
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
      }}
    >
      <Link
        to="/"
        className="navbar-logo"
        style={{
          color: "var(--teal-light)",
          textShadow: "0 0 8px rgba(46,145,148,0.4)",
        }}
      >
        ATLAS
      </Link>

      <div className="navbar-links">
        {loggedIn ? (
          <>
            <Link to="/home">start a scan</Link>
            <Link to="/history">history</Link>
            <Link to="/home">
              <button className="btn">profile</button>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/"
              style={{
                fontWeight: location.pathname === "/" ? "bold" : "normal",
                color:
                  location.pathname === "/" ? "var(--text)" : "var(--text-dim)",
              }}
            >
              home
            </Link>
            <Link
              to="/about"
              style={{
                fontWeight: location.pathname === "/about" ? "bold" : "normal",
                color:
                  location.pathname === "/about"
                    ? "var(--text)"
                    : "var(--text-dim)",
              }}
            >
              about us
            </Link>
            <Link to="/login">
              <button className="btn">get started</button>
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
        }}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </nav>
  );
}
