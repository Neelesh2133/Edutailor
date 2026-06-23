import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";

import ProgressDashboard from "./components/tracker/ProgressDashboard.jsx";

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="animated-bg" />
        <div className="grid-overlay" />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tracker" element={<ProgressDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
