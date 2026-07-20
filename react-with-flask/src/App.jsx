import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Landing from "./pages/Landing";
import About from "./pages/About";
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
    <ThemeProvider defaultTheme="dark" storageKey="atlas-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/scan" element={<InitiateScan />} />
          <Route path="/scan/job" element={<JobPosting />} />
          <Route path="/scan/email" element={<RecruiterEmail />} />
          <Route path="/scan/offer" element={<OfferLetter />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
