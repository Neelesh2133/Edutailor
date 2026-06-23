import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Info } from 'lucide-react';

export default function AIInsightPanel({ insights }) {
  const getIcon = (type) => {
    switch(type) {
      case 'positive': return <TrendingUp className="text-green-400" size={18} />;
      case 'warning': return <AlertCircle className="text-yellow-400" size={18} />;
      default: return <Info className="text-blue-400" size={18} />;
    }
  };

  const getBorderColor = (type) => {
    switch(type) {
      case 'positive': return 'border-green-500/30';
      case 'warning': return 'border-yellow-500/30';
      default: return 'border-blue-500/30';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Sparkles className="text-purple-400" size={20} />
        </div>
        <h3 className="text-xl font-bold text-white">Adaptive AI Insights</h3>
      </div>

      <div className="space-y-4 relative z-10">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className={`flex gap-4 p-4 rounded-xl border bg-slate-900/50 ${getBorderColor(insight.type)}`}
          >
            <div className="shrink-0 mt-0.5">
              {getIcon(insight.type)}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {insight.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
