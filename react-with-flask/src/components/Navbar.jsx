import { Link } from "react-router-dom";

export default function Navbar({ loggedIn = false }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
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
            <Link to="/home">start a scan</Link>
            <Link to="/history">history</Link>
            <Link to="/login">
              <button className="btn">get started</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
