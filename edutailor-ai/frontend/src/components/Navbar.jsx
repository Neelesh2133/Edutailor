import { GraduationCap, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="navbar-title">EduTailor AI</div>
            <div className="navbar-subtitle">Personalized Curriculum Architect</div>
          </div>
        </div>
        <div className="navbar-status">
          <div className="status-dot" />
          <Sparkles size={14} />
          <span>AI Active</span>
        </div>
      </div>
    </nav>
  );
}
