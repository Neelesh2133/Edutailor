import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, BookOpen, Code, Terminal, Trophy } from 'lucide-react';

export default function WeeklyTracker({ week, completedTasks, toggleTask, completedProjects, toggleProject, completedCourses, toggleCourse }) {
  const totalItems = week.tasks.length + (week.weekly_project ? 1 : 0) + week.courses.length;
  
  const completedCount = 
    week.tasks.filter(t => completedTasks.includes(t.id)).length + 
    (week.weekly_project && completedProjects.includes(week.weekly_project.id) ? 1 : 0) +
    week.courses.filter(c => completedCourses.includes(c.id)).length;
    
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedCount / totalItems) * 100);

  const getTaskIcon = (type) => {
    switch (type) {
      case 'reading': return <BookOpen size={16} className="text-blue-400" />;
      case 'practice': return <Code size={16} className="text-purple-400" />;
      default: return <Terminal size={16} className="text-slate-400" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Background glow if completed */}
      {progressPercent === 100 && (
        <div className="absolute inset-0 bg-green-500/5 z-0 pointer-events-none" />
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Week {week.week_number}: {week.title}</h3>
            <p className="text-purple-400 text-sm font-medium">Focus: {week.focus_area}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              {progressPercent}%
            </div>
            <p className="text-slate-400 text-xs mt-1">{completedCount} / {totalItems} completed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-2 mb-8 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          />
        </div>

        {/* Tasks */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Terminal size={16} /> Tasks
          </h4>
          <div className="space-y-3">
            {week.tasks.map(task => {
              const isCompleted = completedTasks.includes(task.id);
              return (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${isCompleted ? 'bg-slate-700/30' : 'bg-slate-700/60 hover:bg-slate-700'}`}
                >
                  <div className="shrink-0">
                    {isCompleted ? 
                      <CheckCircle2 size={24} className="text-green-400" /> : 
                      <Circle size={24} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                    }
                  </div>
                  <div className={`flex-1 flex items-center gap-3 ${isCompleted ? 'opacity-50' : ''}`}>
                    {getTaskIcon(task.type)}
                    <span className={`text-sm font-medium ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {task.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Project */}
        {week.weekly_project && (
          <div className="mb-6">
             <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" /> Mini Project
            </h4>
            <div 
              onClick={() => toggleProject(week.weekly_project.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${completedProjects.includes(week.weekly_project.id) ? 'bg-green-900/20 border-green-500/30' : 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/30'}`}
            >
               <div className="shrink-0 mt-1">
                  {completedProjects.includes(week.weekly_project.id) ? 
                    <CheckCircle2 size={24} className="text-green-400" /> : 
                    <Circle size={24} className="text-purple-500" />
                  }
                </div>
                <div className={completedProjects.includes(week.weekly_project.id) ? 'opacity-70' : ''}>
                  <h5 className={`font-bold ${completedProjects.includes(week.weekly_project.id) ? 'text-green-400 line-through' : 'text-purple-300'}`}>
                    {week.weekly_project.title}
                  </h5>
                  <p className="text-slate-400 text-sm mt-1">{week.weekly_project.description}</p>
                  <div className="inline-block mt-3 px-3 py-1 bg-slate-900/50 rounded-lg text-xs text-slate-300 border border-slate-700/50">
                    Deliverable: <span className="text-white">{week.weekly_project.deliverable}</span>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Courses Section */}
        {week.courses && week.courses.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-400" /> Courses
            </h4>
            <div className="space-y-3">
              {week.courses.map(course => {
                const isCompleted = completedCourses.includes(course.id);
                return (
                  <div key={course.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCompleted ? 'bg-slate-800 border-slate-700' : 'bg-slate-800/80 border-slate-600'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded-md border border-blue-800/50">{course.platform}</span>
                        {course.free && <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-300 rounded-md border border-green-800/50">Free</span>}
                        <span className="text-xs text-slate-400 ml-2">{course.duration}</span>
                      </div>
                      <h5 className={`font-medium ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{course.title}</h5>
                    </div>
                    <div className="flex items-center gap-3 sm:shrink-0">
                      <a href={course.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Start
                      </a>
                      <button 
                        onClick={() => toggleCourse(course.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${isCompleted ? 'bg-green-900/30 text-green-400 border-green-800/50 hover:bg-green-900/50' : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'}`}
                      >
                        {isCompleted ? 'Completed' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
