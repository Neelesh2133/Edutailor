export const mockRoadmapData = {
  roadmap_title: "Full Stack Developer Acceleration",
  total_weeks: 12,
  skills: [
    { name: "HTML", progress: 90 },
    { name: "CSS", progress: 75 },
    { name: "JavaScript", progress: 45 },
    { name: "React", progress: 20 },
    { name: "Node.js", progress: 5 },
  ],
  insights: [
    { id: 1, text: "You are progressing faster than expected.", type: "positive" },
    { id: 2, text: "Consider revising JavaScript fundamentals before moving to React.", type: "warning" },
    { id: 3, text: "Strong consistency detected this week. 18% engagement increase!", type: "info" }
  ],
  achievements: [
    { id: "a1", title: "Week 1 Completed", icon: "CheckCircle", unlocked: true },
    { id: "a2", title: "3 Day Streak", icon: "Zap", unlocked: true },
    { id: "a3", title: "Fast Learner", icon: "Rocket", unlocked: true },
    { id: "a4", title: "AI Explorer", icon: "Brain", unlocked: false },
    { id: "a5", title: "Bug Squasher", icon: "Bug", unlocked: false }
  ],
  weeks: [
    {
      week_number: 1,
      title: "Web Fundamentals",
      focus_area: "HTML & CSS",
      daily_goal_minutes: 60,
      tasks: [
        { id: "w1-t1", name: "Learn HTML Basics", type: "reading" },
        { id: "w1-t2", name: "Build Semantic Layout", type: "practice" },
        { id: "w1-t3", name: "Complete Flexbox Practice", type: "practice" }
      ],
      weekly_project: {
        id: "w1-p1",
        title: "Portfolio Landing Page",
        description: "Create a simple landing page using HTML and CSS",
        deliverable: "GitHub Repo link"
      },
      courses: [
        { id: "w1-c1", title: "Responsive Web Design", platform: "freeCodeCamp", url: "#", duration: "10 hours", free: true }
      ]
    },
    {
      week_number: 2,
      title: "JavaScript Basics",
      focus_area: "Core JS Concepts",
      daily_goal_minutes: 90,
      tasks: [
        { id: "w2-t1", name: "Variables & Data Types", type: "reading" },
        { id: "w2-t2", name: "Control Flow & Loops", type: "practice" },
        { id: "w2-t3", name: "Functions & Scope", type: "practice" }
      ],
      weekly_project: {
        id: "w2-p1",
        title: "Interactive Calculator",
        description: "Build a calculator using vanilla JS",
        deliverable: "CodePen link"
      },
      courses: [
        { id: "w2-c1", title: "JavaScript Algorithms", platform: "freeCodeCamp", url: "#", duration: "15 hours", free: true }
      ]
    },
    {
      week_number: 3,
      title: "Modern UI with React",
      focus_area: "React Components & State",
      daily_goal_minutes: 90,
      tasks: [
        { id: "w3-t1", name: "JSX & Components", type: "reading" },
        { id: "w3-t2", name: "Props & State Management", type: "practice" },
        { id: "w3-t3", name: "Handling Events & Forms", type: "practice" }
      ],
      weekly_project: {
        id: "w3-p1",
        title: "Task Tracker App",
        description: "Build a to-do list with React state",
        deliverable: "Vercel Deployment"
      },
      courses: [
        { id: "w3-c1", title: "React Basics", platform: "Coursera", url: "#", duration: "12 hours", free: false }
      ]
    }
  ]
};
