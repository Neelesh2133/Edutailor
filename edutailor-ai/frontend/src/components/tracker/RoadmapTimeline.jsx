import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, ChevronDown, ChevronUp } from 'lucide-react';
import WeeklyTracker from './WeeklyTracker';

export default function RoadmapTimeline({ data, progressHelpers }) {
  const [expandedWeek, setExpandedWeek] = useState(data.weeks[0]?.week_number);

  return (
    <div className="bg-slate-900 rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <Map className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Learning Timeline</h2>
          <p className="text-slate-400">Your path to becoming a {data.roadmap_title}</p>
        </div>
      </div>

      <div className="relative border-l border-slate-700/50 ml-4 md:ml-6 space-y-8 pb-4">
        {data.weeks.map((week, index) => {
          const isExpanded = expandedWeek === week.week_number;
          
          return (
            <div key={week.week_number} className="relative pl-8 md:pl-10">
              {/* Timeline Node */}
              <div 
                className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center transition-colors ${
                  isExpanded ? 'bg-purple-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-white' : 'bg-slate-400'}`} />
              </div>

              {/* Collapsed View / Header */}
              <div 
                onClick={() => setExpandedWeek(isExpanded ? null : week.week_number)}
                className="cursor-pointer group flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 transition-all"
              >
                <div>
                  <h4 className={`text-lg font-bold transition-colors ${isExpanded ? 'text-purple-400' : 'text-slate-200 group-hover:text-white'}`}>
                    Week {week.week_number}: {week.title}
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">{week.focus_area}</p>
                </div>
                <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Expanded Content (The WeeklyTracker component) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <WeeklyTracker 
                      week={week} 
                      completedTasks={progressHelpers.completedTasks}
                      toggleTask={progressHelpers.toggleTask}
                      completedProjects={progressHelpers.completedProjects}
                      toggleProject={progressHelpers.toggleProject}
                      completedCourses={progressHelpers.completedCourses}
                      toggleCourse={progressHelpers.toggleCourse}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
