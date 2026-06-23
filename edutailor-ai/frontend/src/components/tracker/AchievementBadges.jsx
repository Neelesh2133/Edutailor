import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Zap, Rocket, Brain, Bug } from 'lucide-react';

const ICON_MAP = {
  CheckCircle,
  Zap,
  Rocket,
  Brain,
  Bug
};

export default function AchievementBadges({ achievements }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Award className="text-yellow-400" size={20} />
        </div>
        <h3 className="text-xl font-bold text-white">Achievements</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {achievements.map((badge, index) => {
          const Icon = ICON_MAP[badge.icon] || Award;
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${
                badge.unlocked 
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                  : 'bg-slate-900/50 border-slate-800 grayscale opacity-50'
              }`}
            >
              <div className={`p-3 rounded-full ${badge.unlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
                <Icon size={24} />
              </div>
              <span className={`text-xs font-semibold ${badge.unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                {badge.title}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
