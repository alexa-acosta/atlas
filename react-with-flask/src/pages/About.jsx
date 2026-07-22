import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import heroImage from "../assets/atlas-hero.jpg";
import alexaImg from "../assets/alexa_acosta.JPG";
import brendanImg from "../assets/brendan_chuy.png";
import tetianaImg from "../assets/tetiana_tsarenko.jpg";

const developers = [
  {
    name: "Alexa Acosta",
    title: "CS @ UF 2028",
    image: alexaImg,
  },
  {
    name: "Brendan Chuy",
    title: "CS + Econ @ CU 2028",
    image: brendanImg,
  },
  {
    name: "Tetiana Tsarenko",
    title: "CS @ CU 2028",
    image: tetianaImg,
  },
];

export default function About() {
  const { state } = useLocation();
  const loggedIn =
    state?.loggedIn !== undefined
      ? state.loggedIn
      : localStorage.getItem("isLoggedIn") === "true";

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
      <Navbar loggedIn={loggedIn} />

      <main style={{ flexGrow: 1, paddingTop: "8rem", paddingBottom: "6rem" }}>
        <section
          style={{
            padding: "3rem 2.5rem 6rem",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  marginBottom: "2rem",
                  lineHeight: 1.1,
                }}
              >
                About Atlas
              </h1>
              <p
                style={{
                  color: "var(--text-dim)",
                  lineHeight: 1.9,
                  fontSize: "1rem",
                }}
              >
                Atlas was inspired by our own experiences navigating the
                internship search. From verifying the legitimacy of internship
                offers to receiving suspicious recruiter emails, we saw
                firsthand how difficult it can be to tell the difference between
                genuine opportunities and convincing scams. As recruitment
                increasingly moves online, we recognized the need for a tool
                that helps students evaluate opportunities with confidence
                before clicking links, sharing personal information, or
                accepting an offer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <div
                style={{
                  width: 280,
                  height: 320,
                  background: "var(--bg-card)",
                  borderRadius: "2rem",
                  border: "1px solid var(--teal)",
                  boxShadow: "0 0 40px rgba(21,107,117,0.15)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "box-shadow 0.4s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 60px rgba(21,107,117,0.3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 40px rgba(21,107,117,0.15)")
                }
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, rgba(21,107,117,0.2), transparent)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 24,
                    left: 24,
                    right: 24,
                    bottom: 24,
                    border: "1px solid var(--border)",
                    borderRadius: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={heroImage}
                    alt="Atlas Security"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "1.25rem",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          style={{ padding: "0 2.5rem 4rem", maxWidth: 1100, margin: "0 auto" }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              textAlign: "center",
              marginBottom: "4rem",
            }}
          >
            Meet the Developers
          </motion.h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
            }}
          >
            {developers.map((dev, i) => (
              <motion.div
                key={dev.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  cursor: "default",
                  transition:
                    "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = "var(--teal-light)";
                  e.currentTarget.style.boxShadow =
                    "0 15px 40px rgba(21,107,117,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    marginBottom: "1.5rem",
                    overflow: "hidden",
                    border: "3px solid var(--bg)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={dev.image}
                    alt={dev.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <h3
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  {dev.name}
                </h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                  {dev.title}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

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
