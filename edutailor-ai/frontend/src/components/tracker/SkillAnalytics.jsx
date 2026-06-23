import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function SkillAnalytics({ skills }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Target className="text-blue-400" size={20} />
        </div>
        <h3 className="text-xl font-bold text-white">Skill Gap Analytics</h3>
      </div>

      <div className="space-y-5">
        {skills.map((skill, index) => (
          <div key={index}>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-300">{skill.name}</span>
              <span className="text-xs font-bold text-slate-400">{skill.progress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.progress}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
