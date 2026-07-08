import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import JobPosting from "./pages/JobPosting";
import RecruiterEmail from "./pages/RecruiterEmail";
import OfferLetter from "./pages/OfferLetter";
import InitiateScan from "./pages/InitiateScan";
import Results from "./pages/Results";
import History from "./pages/History";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
