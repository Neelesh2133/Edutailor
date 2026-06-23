import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  Rocket,
  Target,
  BookOpen,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
// promptBuilder available if needed for direct Anthropic calls
import { generateRoadmap } from "../utils/roadmapRenderer.js";
import RoadmapDisplay from "../components/RoadmapDisplay.jsx";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "RAG-enhanced course matching with Gemini AI for intelligent roadmap generation",
    gradient: "feature-gradient-purple",
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    description: "Identifies missing prerequisites and builds a bridge from current level to career goal",
    gradient: "feature-gradient-blue",
  },
  {
    icon: BookOpen,
    title: "Weekly Curriculum",
    description: "Detailed week-by-week plan with topics, exercises, projects, and milestones",
    gradient: "feature-gradient-green",
  },
  {
    icon: Rocket,
    title: "Career Readiness",
    description: "Portfolio projects, interview prep, and industry tool recommendations",
    gradient: "feature-gradient-orange",
  },
];

const STATS = [
  { icon: Users, value: "10K+", label: "Roadmaps Generated" },
  { icon: TrendingUp, value: "95%", label: "Goal Achievement" },
  { icon: Award, value: "6-16", label: "Weeks Adaptive Plan" },
];

export default function Home() {
  // Form state
  const [careerGoal, setCareerGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [weakTopics, setWeakTopics] = useState("");
  const [studyHours, setStudyHours] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("form"); // "form" | "result"
  const [error, setError] = useState("");
  const [roadmapData, setRoadmapData] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    const studentProfile = {
      career_goal: careerGoal,
      current_level: currentLevel,
      weak_topics: weakTopics.split(",").map((t) => t.trim()).filter(Boolean),
      study_hours_per_day: parseInt(studyHours) || 0,
      total_weeks: 14,
    };
    try {
      const roadmap = await generateRoadmap(studentProfile);
      setRoadmapData(roadmap);
      setPhase("result");
    } catch (e) {
      console.error(e);
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCareerGoal("");
    setCurrentLevel("");
    setWeakTopics("");
    setStudyHours("");
    setPhase("form");
    setError("");
    setRoadmapData(null);
  };

  return (
    <main className="home-page">
      <AnimatePresence mode="wait">
        {phase === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <section className="hero-section">
              <div className="container">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="hero-content"
                >
                  <div className="hero-badge">
                    <Sparkles size={14} />
                    <span>Powered by AI‑Driven Engine</span>
                  </div>
                  <h1 className="hero-title">
                    Your Personalized<br />
                    <span className="gradient-text-vibrant">Learning Roadmap</span>
                  </h1>
                  <p className="hero-description">
                    EduTailor AI analyzes your career goals, current skills, and weak areas to generate a detailed, adaptive, industry‑ready learning curriculum tailored specifically for you.
                  </p>
                  <div className="stats-row">
                    {STATS.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="stat-item"
                      >
                        <stat.icon size={18} className="stat-icon" />
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="features-grid">
                    {FEATURES.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className={`feature-card glass-card ${feature.gradient}`}
                      >
                        <div className="feature-icon">
                          <feature.icon size={20} />
                        </div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-description">{feature.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>

            <div className="max-w-3xl mx-auto bg-slate-900 p-8 rounded-3xl shadow-2xl mt-10">
              <div className="space-y-5">
                <input
                  type="text"
                  placeholder="Career Goal"
                  className="w-full p-4 rounded-xl bg-slate-800"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Current Skill Level"
                  className="w-full p-4 rounded-xl bg-slate-800"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Weak Topics (comma separated)"
                  className="w-full p-4 rounded-xl bg-slate-800"
                  value={weakTopics}
                  onChange={(e) => setWeakTopics(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Study Hours Per Day"
                  className="w-full p-4 rounded-xl bg-slate-800"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 p-4 rounded-xl text-lg font-bold"
                >
                  {loading ? "Generating AI Roadmap..." : "Generate Roadmap"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto mt-10 bg-slate-900 p-10 rounded-3xl"
          >
            <h2 className="text-3xl font-bold mb-5">Personalized Learning Path</h2>
            <RoadmapDisplay roadmap={roadmapData} />
            <button
              onClick={handleReset}
              className="mt-6 w-full bg-gray-600 hover:bg-gray-700 p-3 rounded"
            >
              Generate New Roadmap
            </button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-10 text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
