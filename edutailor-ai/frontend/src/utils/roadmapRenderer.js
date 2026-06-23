import API from "../services/api";
import { buildUserPrompt } from "./promptBuilder";

const SYSTEM_PROMPT = `You are EduTailor AI, a Personalized Curriculum Architect.
When generating a learning roadmap, respond ONLY with a valid JSON object matching this schema — no prose, no markdown fences:
{
  "roadmap_title": "string",
  "total_weeks": number,
  "weeks": [
    {
      "week_number": 1,
      "title": "Week 1: <topic name>",
      "focus_area": "string",
      "daily_goal_minutes": number,
      "topics": [
        { "name": "string", "description": "string", "type": "video | reading | practice | project" }
      ],
      "courses": [
        { "title": "string", "platform": "string", "url": "string", "duration": "string", "free": true }
      ],
      "weekly_project": { "title": "string", "description": "string", "deliverable": "string" },
      "success_criteria": ["string", "string", "string"],
      "difficulty": "Beginner | Intermediate | Advanced"
    }
  ],
  "milestone_checkpoints": [
    { "after_week": number, "checkpoint_name": "string", "assessment": "string" }
  ]
}`;

/**
 * Calls the EduTailor backend /generate-path endpoint and returns parsed roadmap JSON.
 * Falls back to building the prompt and hitting backend if direct call is used.
 *
 * @param {Object} studentProfile  - { career_goal, current_level, weak_topics[], study_hours_per_day, total_weeks }
 * @returns {Object} parsed roadmap JSON
 */
export async function generateRoadmap(studentProfile) {
  // Map frontend fields to backend schema
  const requestData = {
    career_goal:           studentProfile.career_goal || "",
    current_level:         studentProfile.current_level || "beginner",
    weak_topics:           studentProfile.weak_topics || [],
    study_hours_per_week:  (studentProfile.study_hours_per_day || 2) * 7,
    studied_credits:       60,
    num_of_prev_attempts:  1,
    total_clicks:          500,
    avg_score:             75,
    active_days:           30,
  };

  const response = await API.post("/generate-path", requestData);
  const data = response.data;

  // The backend returns { roadmap: "...", recommended_courses: [...], ... }
  // roadmap may be a JSON string or already parsed
  let roadmap = data.roadmap;
  if (typeof roadmap === "string") {
    // Strip accidental markdown fences
    const clean = roadmap.replace(/```json|```/g, "").trim();
    try {
      roadmap = JSON.parse(clean);
    } catch {
      // If it's not JSON, wrap as a single-week fallback so the UI doesn't crash
      roadmap = {
        roadmap_title: "Your Personalized Roadmap",
        total_weeks: 1,
        weeks: [],
        milestone_checkpoints: [],
        _raw: clean,
      };
    }
  }

  return roadmap;
}

/**
 * Renders the roadmap JSON into the #roadmap-container DOM element.
 * @param {Object} roadmap - Parsed roadmap JSON
 */
export function renderRoadmapBlocks(roadmap) {
  const container = document.getElementById("roadmap-container");
  if (!container) return;

  container.innerHTML = "";

  // Handle raw (non-JSON) response gracefully
  if (roadmap._raw) {
    container.innerHTML = `<pre style="white-space:pre-wrap;color:#e2e8f0;">${roadmap._raw}</pre>`;
    return;
  }

  if (!Array.isArray(roadmap.weeks) || roadmap.weeks.length === 0) {
    container.innerHTML = `<p style="color:#f87171;">No weeks found in the generated roadmap.</p>`;
    return;
  }

  // Render milestone badges first
  const milestones = roadmap.milestone_checkpoints || [];
  const milestoneMap = {};
  milestones.forEach((m) => {
    milestoneMap[m.after_week] = m;
  });

  roadmap.weeks.forEach((week) => {
    const topicsHTML = (week.topics || [])
      .map(
        (t) => `
        <div class="topic-card">
          <strong>${escapeHtml(t.name)}</strong>
          <span class="topic-type badge-${(t.type || "reading").split("|")[0].trim()}">${escapeHtml(t.type || "")}</span>
          <p>${escapeHtml(t.description || "")}</p>
        </div>`
      )
      .join("");

    const coursesHTML = (week.courses || [])
      .map(
        (c) => `
        <a href="${escapeHtml(c.url || "#")}" target="_blank" rel="noopener noreferrer" class="course-link">
          <span class="course-title">${escapeHtml(c.title || "Course")}</span>
          <span class="course-platform">${escapeHtml(c.platform || "")}</span>
          <span class="course-duration">${escapeHtml(c.duration || "")}</span>
          ${c.free ? '<span class="free-badge">FREE</span>' : ""}
        </a>`
      )
      .join("");

    const project = week.weekly_project || {};
    const projectHTML = `
      <div class="project-card">
        <strong>${escapeHtml(project.title || "Weekly Project")}</strong>
        <p>${escapeHtml(project.description || "")}</p>
        <em>Deliverable: ${escapeHtml(project.deliverable || "")}</em>
      </div>`;

    const criteriaHTML = (week.success_criteria || [])
      .map((c) => `<li>${escapeHtml(c)}</li>`)
      .join("");

    const difficultyClass =
      week.difficulty === "Advanced"
        ? "difficulty-advanced"
        : week.difficulty === "Intermediate"
        ? "difficulty-intermediate"
        : "difficulty-beginner";

    const block = `
      <div class="week-block">
        <div class="week-header">
          <h2>${escapeHtml(week.title || `Week ${week.week_number}`)}</h2>
          <span class="difficulty-badge ${difficultyClass}">${escapeHtml(week.difficulty || "Beginner")}</span>
        </div>
        <p class="focus-area"><strong>Focus:</strong> ${escapeHtml(week.focus_area || "")}</p>
        <p class="daily-goal"><strong>Daily Goal:</strong> ${week.daily_goal_minutes || 60} min/day</p>

        <h3>📚 Topics</h3>
        <div class="topics-grid">${topicsHTML}</div>

        <h3>🔗 Courses</h3>
        <div class="courses-list">${coursesHTML}</div>

        <h3>🛠 Weekly Project</h3>
        ${projectHTML}

        <h3>✅ Success Criteria</h3>
        <ul class="criteria-list">${criteriaHTML}</ul>
      </div>
    `;

    container.innerHTML += block;

    // Insert milestone checkpoint card after the week if applicable
    if (milestoneMap[week.week_number]) {
      const m = milestoneMap[week.week_number];
      container.innerHTML += `
        <div class="milestone-card">
          <span class="milestone-icon">🏁</span>
          <div>
            <strong>${escapeHtml(m.checkpoint_name)}</strong>
            <p>${escapeHtml(m.assessment)}</p>
          </div>
        </div>
      `;
    }
  });
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
