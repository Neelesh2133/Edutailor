import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MousePointer2, Clock, BookOpen } from 'lucide-react';

const AnalyticsCard = ({ label, value, subtext, icon: Icon, trend }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-start gap-5 transition-colors hover:border-indigo-500/30"
    >
      <div className="p-3 bg-indigo-500/10 rounded-xl">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
          {trend && (
            <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}%
            </span>
          )}
        </div>
        
        <h4 className="text-2xl font-bold text-white mb-1">{value}</h4>
        <p className="text-slate-500 text-xs">{subtext}</p>
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;
