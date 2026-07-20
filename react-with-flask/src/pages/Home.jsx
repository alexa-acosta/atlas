import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Shield,
  Search,
  AlertTriangle,
  Mail,
  Link as LinkIcon,
} from "lucide-react";

function Counter({ end, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min(
          (timestamp - startTimestamp) / (duration * 1000),
          1,
        );
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(easeOut * end));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-mono)",
        overflowX: "hidden",
      }}
    >
      <Navbar loggedIn />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          paddingTop: "5rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.03,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 1px, #000 1px, #000 2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.05,
            backgroundImage:
              "linear-gradient(var(--teal) 1px, transparent 1px), linear-gradient(90deg, var(--teal) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            background: "rgba(21,107,117,0.1)",
            borderRadius: "50%",
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            padding: "0 2.5rem",
            position: "relative",
            zIndex: 10,
            maxWidth: 1100,
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(3rem, 8vw, 6rem)",
              marginBottom: "2rem",
              fontFamily: "var(--font-serif)",
              lineHeight: 1.1,
            }}
          >
            Stay safe,
            <br />
            <span
              style={{
                color: "var(--teal-light)",
                textShadow: "0 0 15px rgba(46,145,148,0.2)",
              }}
            >
              stay smart!
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "1.1rem",
              color: "var(--text-dim)",
              maxWidth: 580,
              lineHeight: 1.8,
              marginBottom: "2.5rem",
            }}
          >
            Navigate your job search with confidence. Atlas scans job-related
            communications for phishing, impersonation, and scam indicators so
            you can make informed decisions before sharing personal information.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="btn"
            onClick={() => navigate("/scan")}
            style={{
              fontSize: "1rem",
              padding: "0.75rem 2rem",
              boxShadow: "0 0 20px rgba(21,107,117,0.4)",
            }}
          >
            start a scan →
          </motion.button>
        </div>
      </section>

      {/* Stats Bar */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { label: "Employment Scam Growth", val: 295, suffix: "%" },
            { label: "Money Laundering Scams", val: 609, suffix: "%" },
            { label: "Fraudulent Job Posts", val: 60000, suffix: "+" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "3rem",
                textAlign: "center",
                borderRight: i < 2 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-dim)",
                  marginBottom: "1rem",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "3.5rem",
                  fontWeight: 700,
                  color: "var(--teal-light)",
                }}
              >
                <Counter end={stat.val} suffix={stat.suffix} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Atlas Works */}
      <section style={{ padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.8rem",
              marginBottom: "1.5rem",
            }}
          >
            How Atlas Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              color: "var(--text-dim)",
              lineHeight: 1.8,
              marginBottom: "4rem",
              maxWidth: 680,
            }}
          >
            Every submission is parsed through AI and trusted security APIs to
            produce a legitimacy score from 0–100, highlight key risk factors,
            recommend next steps, and extract job details like title, location,
            and work style.
          </motion.p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
              maxWidth: 700,
              margin: "0 auto",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {["job posting", "recruiter email", "offer letter"].map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: 999,
                    border: "1px solid var(--teal)",
                    background: "var(--bg-card)",
                    color: "var(--teal-light)",
                  }}
                >
                  {t}
                </span>
              ))}
            </motion.div>
            <div style={{ color: "var(--teal-light)", fontSize: "1.5rem" }}>
              ↓
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{
                padding: "0.6rem 2rem",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "var(--bg-input)",
              }}
            >
              parse & extract
            </motion.div>
            <div style={{ color: "var(--teal-light)", fontSize: "1.5rem" }}>
              ↓
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              style={{
                padding: "0.6rem 2rem",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "var(--bg-input)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Search size={16} style={{ color: "var(--teal-light)" }} /> AI &
              security APIs
            </motion.div>
            <div style={{ color: "var(--teal-light)", fontSize: "1.5rem" }}>
              ↓
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {["risk score", "explanations", "recommendations"].map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: 999,
                    border: "2px solid var(--teal)",
                    background: "rgba(21,107,117,0.1)",
                    fontWeight: "bold",
                  }}
                >
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* When to Use Atlas */}
      <section style={{ padding: "6rem 2.5rem", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.h2
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2.8rem",
              textAlign: "right",
              marginBottom: "3rem",
            }}
          >
            When to Use Atlas
          </motion.h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5rem",
            }}
          >
            {[
              {
                icon: <LinkIcon size={28} />,
                title: "Suspicious Links",
                desc: "Before clicking a link in a cold recruiter email.",
              },
              {
                icon: <Mail size={28} />,
                title: "Offer Letters",
                desc: "When evaluating an unexpectedly urgent internship offer letter.",
              },
              {
                icon: <AlertTriangle size={28} />,
                title: "Red Flags",
                desc: "When something about a job posting seems slightly off or too good to be true.",
              },
              {
                icon: <Shield size={28} />,
                title: "Data Protection",
                desc: "Before sharing sensitive personal information with a new employer.",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card"
                style={{
                  cursor: "default",
                  border: "1px solid var(--border)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--teal-light)";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(21,107,117,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{ color: "var(--teal-light)", marginBottom: "1rem" }}
                >
                  {card.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.2rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ color: "var(--text-dim)", lineHeight: 1.7 }}>
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "3rem 2.5rem",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-card)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--teal-light)",
            marginBottom: "0.5rem",
            letterSpacing: "0.1em",
          }}
        >
          ATLAS
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
          © 2025 Atlas. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
