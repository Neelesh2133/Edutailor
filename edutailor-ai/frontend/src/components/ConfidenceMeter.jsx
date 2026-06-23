import React from 'react';
import { motion } from 'framer-motion';

const ConfidenceMeter = ({ value }) => {
  const percentage = value * 100;
  
  return (
    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Model Confidence</p>
        <span className="text-white font-mono font-bold">{percentage.toFixed(1)}%</span>
      </div>
      
      <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${
            percentage > 80 ? 'from-indigo-500 to-emerald-500' : 'from-orange-500 to-amber-400'
          }`}
        />
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 flex justify-between px-2 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-px h-full bg-slate-400" />
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${percentage > 80 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
        <p className="text-slate-500 text-xs italic">
          {percentage > 80 
            ? "High-reliability prediction based on consistent engagement patterns." 
            : "Moderate confidence. Subject behavior shows mixed predictive signals."}
        </p>
      </div>
    </div>
  );
};

export default ConfidenceMeter;
