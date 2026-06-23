import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  GraduationCap,
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Brain,
  Zap,
  Palette,
} from "lucide-react";

const STEPS = [
  {
    id: 0,
    title: "Career Goal",
    subtitle: "What do you want to become?",
    icon: Target,
    field: "career_goal",
    type: "text",
    placeholder: "e.g., AI Engineer, Full-Stack Developer, Data Scientist...",
    hint: "Be specific — this shapes your entire learning path",
  },
  {
    id: 1,
    title: "Current Level",
    subtitle: "Where are you right now?",
    icon: GraduationCap,
    field: "current_level",
    type: "select",
    options: [
      { value: "absolute_beginner", label: "🌱 Absolute Beginner — No coding experience" },
      { value: "beginner", label: "📗 Beginner — Basic programming knowledge" },
      { value: "intermediate", label: "📘 Intermediate — Comfortable with one language" },
      { value: "advanced", label: "📕 Advanced — Strong in multiple technologies" },
    ],
    hint: "Be honest — this ensures the roadmap starts at the right level",
  },
  {
    id: 2,
    title: "Weak Topics",
    subtitle: "Where do you struggle?",
    icon: AlertTriangle,
    field: "weak_topics",
    type: "tags",
    placeholder: "Type a topic and press Enter...",
    suggestions: [
      "Mathematics",
      "Data Structures",
      "Algorithms",
      "OOP Concepts",
      "Database Design",
      "System Design",
      "Machine Learning",
      "Statistics",
      "Web Development",
      "APIs",
      "Git & Version Control",
      "Cloud Services",
    ],
    hint: "Add topics where you need the most improvement",
  },
  {
    id: 3,
    title: "Learning Style",
    subtitle: "How do you learn best?",
    icon: Palette,
    field: "learning_style",
    type: "select",
    options: [
      { value: "visual", label: "👁️ Visual — Diagrams, videos, UI mockups" },
      { value: "practical", label: "🛠️ Practical — Hands-on projects, code-first" },
      { value: "theoretical", label: "📚 Theoretical — Deep dives into concepts, reading" },
      { value: "mixed", label: "🔀 Mixed — A bit of everything" },
    ],
    hint: "This helps AI tailor the types of exercises and resources",
  },
  {
    id: 4,
    title: "Study Hours",
    subtitle: "How much time can you dedicate weekly?",
    icon: Clock,
    field: "study_hours_per_week",
    type: "slider",
    min: 2,
    max: 40,
    default: 10,
    hint: "This determines your roadmap pace and depth",
  },
];

export default function StudentForm({ onSubmit, isLoading }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    career_goal: "",
    current_level: "",
    weak_topics: [],
    learning_style: "",
    study_hours_per_week: 10,
  });
  const [tagInput, setTagInput] = useState("");

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const canProceed = () => {
    const field = currentStep.field;
    if (field === "weak_topics") return formData.weak_topics.length > 0;
    if (field === "study_hours_per_week") return true;
    return formData[field] && formData[field].toString().trim() !== "";
  };

  const handleNext = () => {
    if (isLastStep) {
      onSubmit(formData);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleTagAdd = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !formData.weak_topics.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        weak_topics: [...prev.weak_topics, trimmed],
      }));
    }
    setTagInput("");
  };

  const handleTagRemove = (tag) => {
    setFormData((prev) => ({
      ...prev,
      weak_topics: prev.weak_topics.filter((t) => t !== tag),
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentStep.type === "tags" && tagInput.trim()) {
        handleTagAdd(tagInput);
      } else if (canProceed()) {
        handleNext();
      }
    }
  };

  return (
    <div className="form-wrapper">
      {/* Progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <div className="progress-labels">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`progress-dot ${i <= step ? "active" : ""} ${i < step ? "completed" : ""}`}
              onClick={() => i <= step && setStep(i)}
            >
              <div className="dot-circle">
                {i < step ? "✓" : i + 1}
              </div>
              <span className="dot-label">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="glass-card form-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="step-content"
          >
            {/* Step header */}
            <div className="step-header">
              <div className="step-icon-wrapper">
                <currentStep.icon size={28} />
              </div>
              <div>
                <h2 className="step-title">{currentStep.title}</h2>
                <p className="step-subtitle">{currentStep.subtitle}</p>
              </div>
            </div>

            {/* Step input */}
            <div className="step-input-area">
              {currentStep.type === "text" && (
                <input
                  id={`input-${currentStep.field}`}
                  type="text"
                  className="input-field input-large"
                  placeholder={currentStep.placeholder}
                  value={formData[currentStep.field]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [currentStep.field]: e.target.value,
                    }))
                  }
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              )}

              {currentStep.type === "select" && (
                <div className="select-grid">
                  {currentStep.options.map((opt) => (
                    <button
                      key={opt.value}
                      id={`select-${opt.value}`}
                      className={`select-option ${formData[currentStep.field] === opt.value ? "selected" : ""}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          [currentStep.field]: opt.value,
                        }))
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {currentStep.type === "tags" && (
                <div className="tags-area">
                  <div className="tags-input-row">
                    <input
                      id={`input-${currentStep.field}`}
                      type="text"
                      className="input-field"
                      placeholder={currentStep.placeholder}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  </div>

                  {/* Selected tags */}
                  {formData.weak_topics.length > 0 && (
                    <div className="selected-tags">
                      {formData.weak_topics.map((tag) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="tag tag-purple"
                        >
                          {tag}
                          <button
                            className="tag-remove"
                            onClick={() => handleTagRemove(tag)}
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="tag-suggestions">
                    <span className="suggestions-label">Quick add:</span>
                    <div className="suggestions-list">
                      {currentStep.suggestions
                        .filter((s) => !formData.weak_topics.includes(s))
                        .slice(0, 8)
                        .map((s) => (
                          <button
                            key={s}
                            className="suggestion-chip"
                            onClick={() => handleTagAdd(s)}
                          >
                            + {s}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep.type === "slider" && (
                <div className="slider-area">
                  <div className="slider-value-display">
                    <motion.span
                      key={formData.study_hours_per_week}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="slider-value"
                    >
                      {formData.study_hours_per_week}
                    </motion.span>
                    <span className="slider-unit">hours/week</span>
                  </div>
                  <input
                    id={`input-${currentStep.field}`}
                    type="range"
                    className="range-slider"
                    min={currentStep.min}
                    max={currentStep.max}
                    value={formData.study_hours_per_week}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        study_hours_per_week: parseInt(e.target.value),
                      }))
                    }
                  />
                  <div className="slider-labels">
                    <span>2h — Casual</span>
                    <span>10h — Moderate</span>
                    <span>20h — Intensive</span>
                    <span>40h — Full-time</span>
                  </div>
                  <div className="slider-info">
                    {formData.study_hours_per_week <= 5 && (
                      <span className="tag tag-yellow">📖 Relaxed pace — ~12 week roadmap</span>
                    )}
                    {formData.study_hours_per_week > 5 && formData.study_hours_per_week <= 10 && (
                      <span className="tag tag-purple">⚡ Moderate pace — ~8-10 week roadmap</span>
                    )}
                    {formData.study_hours_per_week > 10 && formData.study_hours_per_week <= 20 && (
                      <span className="tag tag-green">🚀 Intensive pace — ~6-8 week roadmap</span>
                    )}
                    {formData.study_hours_per_week > 20 && (
                      <span className="tag tag-green">🔥 Full-time pace — ~6 week accelerated roadmap</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Hint */}
            <p className="step-hint">
              <Zap size={14} />
              {currentStep.hint}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="form-navigation">
          <button
            className="nav-btn nav-back"
            onClick={handleBack}
            disabled={step === 0}
            id="btn-back"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            id="btn-next"
          >
            {isLastStep ? (
              <>
                <Sparkles size={18} />
                <span>Generate Roadmap</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
