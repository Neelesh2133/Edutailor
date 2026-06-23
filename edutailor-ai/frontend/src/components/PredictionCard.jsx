import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  ShieldAlert,
  Zap,
  BrainCircuit,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Activity,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   PredictionCard.jsx — EduTailor AI Learner Prediction Dashboard Card
   Premium dark-mode glassmorphism component with animated confidence ring,
   adaptive pace badge, and AI-generated recommendation text.
   ───────────────────────────────────────────────────────────────────────────── */

// ── Animated Circular Progress ──────────────────────────────────────────────
const CircularProgress = ({ value, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-40"
        style={{
          background:
            percentage > 75
              ? 'radial-gradient(circle, #818cf8 0%, transparent 70%)'
              : 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(100, 116, 139, 0.15)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="url(#progressGradient)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.4 }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center percentage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <CountUp target={percentage} />
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
          Confidence
        </span>
      </div>
    </div>
  );
};

// ── Animated Count-Up Number ────────────────────────────────────────────────
const CountUp = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.round(target * 10) / 10;
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.round(start * 10) / 10);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="text-2xl font-black text-white font-mono tabular-nums">
      {count.toFixed(1)}
      <span className="text-base text-indigo-400">%</span>
    </span>
  );
};

// ── Pace Badge Config ───────────────────────────────────────────────────────
const PACE_CONFIG = {
  Accelerated: {
    color: 'from-indigo-500/20 to-purple-500/20',
    border: 'border-indigo-500/30',
    text: 'text-indigo-300',
    dot: 'bg-indigo-400',
    icon: Rocket,
  },
  Balanced: {
    color: 'from-cyan-500/20 to-teal-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
    dot: 'bg-cyan-400',
    icon: Activity,
  },
  'Foundation Focused': {
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    icon: ShieldAlert,
  },
};

// ── Recommendation Generator ────────────────────────────────────────────────
const getRecommendation = (category, confidence) => {
  if (category === 'Career Ready Learner') {
    if (confidence > 90)
      return 'Student demonstrates exceptional engagement consistency and advanced learning capability. Accelerated industry-track curriculum activated.';
    if (confidence > 70)
      return 'Strong performance signals detected across assessments. Roadmap calibrated for rapid skill acquisition with portfolio-grade projects.';
    return 'Positive learning trajectory identified. Curriculum includes advanced modules with strategic reinforcement checkpoints.';
  }
  if (confidence > 90)
    return 'Significant skill gaps detected with low engagement duration. Roadmap restructured with foundational deep-dives and weekly revision cycles.';
  if (confidence > 70)
    return 'Mixed performance signals observed. Curriculum balanced with prerequisite remediation and guided hands-on projects.';
  return 'Early-stage learner profile detected. Roadmap emphasizes fundamentals, scaffolded exercises, and frequent progress checkpoints.';
};

// ── Main Component ──────────────────────────────────────────────────────────
const PredictionCard = ({
  learnerCategory = 'Career Ready Learner',
  confidence = 0.95,
  adaptivePace = 'Accelerated',
}) => {
  const isHighPotential = learnerCategory === 'Career Ready Learner';
  const pct = Math.round(confidence * 1000) / 10; // e.g. 0.95 → 95.0
  const pace = PACE_CONFIG[adaptivePace] || PACE_CONFIG['Balanced'];
  const PaceIcon = pace.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative w-full max-w-xl mx-auto"
    >
      {/* ── Outer hover glow ─────────────────────────────────────────── */}
      <div
        className={`absolute -inset-px rounded-[22px] opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-700 ${
          isHighPotential
            ? 'bg-gradient-to-r from-indigo-600/50 via-purple-600/50 to-blue-600/50'
            : 'bg-gradient-to-r from-amber-600/50 via-orange-600/50 to-rose-600/50'
        }`}
      />

      {/* ── Card body ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[20px] border border-slate-700/60 bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-black/30">
        {/* Ambient background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={`absolute -top-32 -right-32 h-72 w-72 rounded-full blur-[120px] opacity-20 ${
              isHighPotential ? 'bg-indigo-600' : 'bg-amber-600'
            }`}
          />
          <div
            className={`absolute -bottom-24 -left-24 h-56 w-56 rounded-full blur-[100px] opacity-15 ${
              isHighPotential ? 'bg-purple-600' : 'bg-orange-600'
            }`}
          />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* ── Header Strip ───────────────────────────────────────────── */}
        <div className="relative flex items-center gap-2 px-6 pt-5 pb-3">
          <BrainCircuit className="h-4 w-4 text-indigo-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            EduTailor Neural Engine
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        {/* ── Main Content ───────────────────────────────────────────── */}
        <div className="relative px-6 pt-6 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Left: Category + Badge */}
            <div className="flex-1 min-w-0">
              {/* Category Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${
                  isHighPotential
                    ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-1 ring-indigo-500/20'
                    : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-500/20'
                }`}
              >
                {isHighPotential ? (
                  <Rocket className="w-6 h-6 text-indigo-400" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-amber-400" />
                )}
              </div>

              {/* Category Label */}
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                Predicted Classification
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
                {learnerCategory}
              </h2>

              {/* Adaptive Pace Badge */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r ${pace.color} border ${pace.border}`}
              >
                <PaceIcon className={`w-3.5 h-3.5 ${pace.text}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${pace.text}`}>
                  {adaptivePace}
                </span>
              </motion.div>
            </div>

            {/* Right: Confidence Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex-shrink-0"
            >
              <CircularProgress value={pct} size={130} strokeWidth={8} />
            </motion.div>
          </div>

          {/* ── AI Recommendation ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-7 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1.5">
                  AI Recommendation
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {getRecommendation(learnerCategory, pct)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Bottom Stats Row ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-5 flex items-center justify-between text-xs text-slate-600"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              <span>Stacking Ensemble · XGB + LGBM + RF</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>39 features analyzed</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionCard;
