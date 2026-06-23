import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Search,
  BookOpen,
  Sparkles,
  CheckCircle,
  Loader,
} from "lucide-react";

const LOADING_STEPS = [
  { icon: Search, text: "Analyzing your student profile...", delay: 0 },
  { icon: BookOpen, text: "Searching course database with RAG...", delay: 2000 },
  { icon: Brain, text: "Building personalized curriculum...", delay: 5000 },
  { icon: Sparkles, text: "Generating detailed weekly roadmap...", delay: 9000 },
];

export default function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = LOADING_STEPS.map((step, index) =>
      setTimeout(() => setActiveStep(index), step.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="loading-container">
      {/* Animated orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="loading-orb"
      >
        <div className="orb-core" />
      </motion.div>

      {/* Status text */}
      <div>
        <div className="loading-text">EduTailor AI is crafting your roadmap</div>
        <div className="loading-subtitle">
          This typically takes 15-30 seconds • {elapsedTime}s elapsed
        </div>
      </div>

      {/* Progress steps */}
      <div className="loading-steps">
        {LOADING_STEPS.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.delay / 1000 }}
            className={`loading-step ${
              index === activeStep ? "active" : ""
            } ${index < activeStep ? "completed" : ""}`}
          >
            <step.icon className="step-icon" />
            <span>{step.text}</span>
            {index < activeStep && <CheckCircle size={16} style={{ marginLeft: "auto", color: "var(--success)" }} />}
            {index === activeStep && <Loader size={16} style={{ marginLeft: "auto", animation: "orbSpin 1s linear infinite" }} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
