import { useState, useEffect } from 'react';

export function useProgress(roadmapId = 'default_roadmap') {
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem(`${roadmapId}_completedTasks`);
    return saved ? JSON.parse(saved) : [];
  });

  const [completedCourses, setCompletedCourses] = useState(() => {
    const saved = localStorage.getItem(`${roadmapId}_completedCourses`);
    return saved ? JSON.parse(saved) : [];
  });

  const [completedProjects, setCompletedProjects] = useState(() => {
    const saved = localStorage.getItem(`${roadmapId}_completedProjects`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`${roadmapId}_completedTasks`, JSON.stringify(completedTasks));
  }, [completedTasks, roadmapId]);

  useEffect(() => {
    localStorage.setItem(`${roadmapId}_completedCourses`, JSON.stringify(completedCourses));
  }, [completedCourses, roadmapId]);

  useEffect(() => {
    localStorage.setItem(`${roadmapId}_completedProjects`, JSON.stringify(completedProjects));
  }, [completedProjects, roadmapId]);

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleCourse = (courseId) => {
    setCompletedCourses(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const toggleProject = (projectId) => {
    setCompletedProjects(prev => 
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  return {
    completedTasks,
    toggleTask,
    completedCourses,
    toggleCourse,
    completedProjects,
    toggleProject
  };
}
