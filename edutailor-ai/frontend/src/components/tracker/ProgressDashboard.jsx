import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, TrendingUp, BookOpen } from 'lucide-react';
import { mockRoadmapData } from '../../data/mockData';
import { useProgress } from '../../hooks/useProgress';
import SkillAnalytics from './SkillAnalytics';
import AIInsightPanel from './AIInsightPanel';
import AchievementBadges from './AchievementBadges';
import RoadmapTimeline from './RoadmapTimeline';

export default function ProgressDashboard() {
  const data = mockRoadmapData;
  const progressHelpers = useProgress('demo_roadmap');

  // Calculate overall stats
  let totalItems = 0;
  let completedItems = 0;

  data.weeks.forEach(week => {
    totalItems += week.tasks.length + (week.weekly_project ? 1 : 0) + (week.courses ? week.courses.length : 0);
    completedItems += week.tasks.filter(t => progressHelpers.completedTasks.includes(t.id)).length;
    if (week.weekly_project && progressHelpers.completedProjects.includes(week.weekly_project.id)) {
      completedItems += 1;
    }
    if (week.courses) {
      completedItems += week.courses.filter(c => progressHelpers.completedCourses.includes(c.id)).length;
    }
  });

  const overallProgress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 mb-2"
            >
              Learning Hub
            </motion.h1>
            <p className="text-slate-400 text-lg">Your personalized AI tracking dashboard.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 flex items-center gap-2">
               <Clock className="text-blue-400" size={18} />
               <span className="text-sm font-medium">Est. 4 Weeks Left</span>
             </div>
          </div>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Overall Progress" 
            value={`${overallProgress}%`} 
            icon={<TrendingUp className="text-purple-400" size={24} />} 
            gradient="from-purple-500/20 to-purple-600/5"
            borderColor="border-purple-500/20"
          />
          <StatCard 
            title="Tasks Completed" 
            value={`${completedItems} / ${totalItems}`} 
            icon={<CheckCircle2 className="text-green-400" size={24} />} 
            gradient="from-green-500/20 to-green-600/5"
            borderColor="border-green-500/20"
          />
          <StatCard 
            title="Current Streak" 
            value="3 Days" 
            icon={<TrendingUp className="text-orange-400" size={24} />} 
            gradient="from-orange-500/20 to-orange-600/5"
            borderColor="border-orange-500/20"
          />
          <StatCard 
            title="Weeks Completed" 
            value="0 / 12" 
            icon={<BookOpen className="text-blue-400" size={24} />} 
            gradient="from-blue-500/20 to-blue-600/5"
            borderColor="border-blue-500/20"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <RoadmapTimeline data={data} progressHelpers={progressHelpers} />
          </div>

          {/* Right Column - Analytics & AI Insights */}
          <div className="space-y-8">
            <AIInsightPanel insights={data.insights} />
            <SkillAnalytics skills={data.skills} />
            <AchievementBadges achievements={data.achievements} />
          </div>

        </div>

      </div>
    </div>
  );
}

// Sub-component for Stat Cards
function StatCard({ title, value, icon, gradient, borderColor }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} border ${borderColor} backdrop-blur-sm relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
        {icon}
      </div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </motion.div>
  );
}
