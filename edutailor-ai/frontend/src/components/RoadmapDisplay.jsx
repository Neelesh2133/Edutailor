export default function RoadmapDisplay({ roadmap }) {
  if (!roadmap) return null;

  let data = null;
  try {
    data = typeof roadmap === "string" ? JSON.parse(roadmap) : roadmap;
  } catch (e) {
    console.error("Failed to parse roadmap JSON", e);
    return <div className="text-red-500">Failed to parse roadmap data.</div>;
  }

  if (!data) return null;

  if (data._raw && (!data.weeks || data.weeks.length === 0)) {
    return (
      <div className="bg-slate-900 p-8 rounded-3xl mt-8 text-white">
        <h2 className="text-3xl font-bold mb-4">{data.roadmap_title || "Your Personalized Roadmap"}</h2>
        <pre className="whitespace-pre-wrap text-slate-300 font-mono text-sm bg-slate-800 p-4 rounded-xl border border-slate-700">
          {data._raw}
        </pre>
      </div>
    );
  }

  if (!data.weeks || data.weeks.length === 0) return null;

  return (
    <div className="bg-slate-900 p-8 rounded-3xl mt-8 text-white">

      {/* Header */}
      <h2 className="text-3xl font-bold mb-2">{data.roadmap_title}</h2>
      <p className="text-slate-400 mb-8">{data.total_weeks} Week Program</p>

      {/* Week Blocks */}
      <div className="flex flex-col gap-6">
        {data.weeks.map((week) => (
          <div
            key={week.week_number}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          >
            {/* Week Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{week.title}</h3>
              <div className="flex gap-2">
                <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                  {week.difficulty}
                </span>
                <span className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full">
                  ⏱ {week.daily_goal_minutes} min/day
                </span>
              </div>
            </div>

            <p className="text-purple-400 text-sm mb-5">
              🎯 Focus: <strong>{week.focus_area}</strong>
            </p>

            {/* Topics */}
            <div className="mb-5">
              <h4 className="text-slate-300 font-semibold mb-3">📚 Topics</h4>
              <div className="flex flex-col gap-2">
                {(week.topics || []).map((topic, i) => (
                  <div
                    key={i}
                    className="bg-slate-700 rounded-xl px-4 py-3 flex gap-3 items-start"
                  >
                    <span className="bg-purple-800 text-purple-200 text-xs px-2 py-0.5 rounded-full mt-0.5 shrink-0">
                      {topic.type}
                    </span>
                    <div>
                      <p className="text-white font-medium text-sm">{topic.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{topic.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div className="mb-5">
              <h4 className="text-slate-300 font-semibold mb-3">🔗 Courses</h4>
              <div className="flex flex-col gap-2">
                {(week.courses || []).map((course, i) => (
                  <a
                    key={i}
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-700 hover:bg-slate-600 transition rounded-xl px-4 py-3 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-purple-300 transition">
                        {course.title}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {course.platform} · {course.duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {course.free && (
                        <span className="bg-green-800 text-green-300 text-xs px-2 py-0.5 rounded-full">
                          FREE
                        </span>
                      )}
                      <span className="text-slate-400 group-hover:text-white transition text-lg">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Weekly Project */}
            {week.weekly_project && (
              <div className="mb-5 bg-purple-900/30 border border-purple-700/40 rounded-xl p-4">
                <h4 className="text-purple-300 font-semibold mb-2">🛠 Weekly Project</h4>
                <p className="text-white font-medium text-sm">{week.weekly_project.title}</p>
                <p className="text-slate-400 text-xs mt-1">{week.weekly_project.description}</p>
                <p className="text-green-400 text-xs mt-2">
                  ✅ Deliverable: {week.weekly_project.deliverable}
                </p>
              </div>
            )}

            {/* Success Criteria */}
            <div>
              <h4 className="text-slate-300 font-semibold mb-2">🏁 You've mastered this week when...</h4>
              <ul className="flex flex-col gap-1">
                {(week.success_criteria || []).map((criteria, i) => (
                  <li key={i} className="text-slate-400 text-xs flex gap-2">
                    <span className="text-green-400 shrink-0">✓</span>
                    {criteria}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Milestone Checkpoints */}
      {data.milestone_checkpoints?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">🚩 Milestone Checkpoints</h3>
          <div className="flex flex-col gap-3">
            {data.milestone_checkpoints.map((m, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-yellow-700/40 rounded-xl p-4"
              >
                <p className="text-yellow-400 font-semibold text-sm">
                  After Week {m.after_week}: {m.checkpoint_name}
                </p>
                <p className="text-slate-400 text-xs mt-1">{m.assessment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
