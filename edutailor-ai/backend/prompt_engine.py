def calculate_roadmap_params(student_profile):
    """Calculate roadmap parameters based on student profile."""
    study_hours = student_profile.get('study_hours_per_week', 10)
    current_level = student_profile.get('current_level', 'beginner')
    weak_topics = student_profile.get('weak_topics', [])

    # Determine total weeks based on study hours AND complexity
    if study_hours <= 5:
        base_weeks = 12
    elif study_hours <= 10:
        base_weeks = 10
    elif study_hours <= 20:
        base_weeks = 8
    else:
        base_weeks = 6

    # Adjust for skill level
    level_multiplier = {
        'absolute_beginner': 1.3,
        'beginner': 1.15,
        'intermediate': 1.0,
        'advanced': 0.85,
    }
    multiplier = level_multiplier.get(current_level, 1.0)

    # Adjust for number of weak topics
    weak_adjustment = min(len(weak_topics) * 0.5, 3)

    total_weeks = max(6, min(16, round(base_weeks * multiplier + weak_adjustment)))

    # Calculate daily study hours
    daily_hours = round(study_hours / 7, 1)

    # Determine pace label
    if study_hours <= 5:
        pace = "Relaxed"
    elif study_hours <= 10:
        pace = "Moderate"
    elif study_hours <= 20:
        pace = "Intensive"
    else:
        pace = "Full-time Accelerated"

    return {
        'total_weeks': total_weeks,
        'daily_hours': daily_hours,
        'pace': pace,
        'study_hours': study_hours,
    }


def get_prerequisite_topics(current_level, career_goal):
    """Identify likely prerequisite gaps based on level and goal."""
    prerequisites = {
        'absolute_beginner': [
            "Computer fundamentals and file management",
            "Basic logic and problem-solving thinking",
            "Introduction to programming concepts",
            "Terminal/command-line basics",
            "Setting up a development environment",
        ],
        'beginner': [
            "Programming fundamentals (variables, loops, functions)",
            "Basic data types and control flow",
            "Introduction to debugging",
            "Version control with Git",
        ],
        'intermediate': [
            "Object-oriented programming",
            "Database fundamentals",
            "API concepts",
            "Testing basics",
        ],
        'advanced': [
            "System design principles",
            "Advanced algorithms",
            "Performance optimization",
        ],
    }
    return prerequisites.get(current_level, prerequisites['beginner'])


def build_prompt(student_profile, retrieved_courses):
    """Build a structured JSON-output prompt for the AI curriculum generation."""

    # Format retrieved courses
    course_text = ""
    for i, course in enumerate(retrieved_courses, 1):
        course_text += (
            f"[{i}] {course.get('title', 'Unknown')} | "
            f"{course.get('provider', 'Unknown')} | "
            f"{course.get('duration', 'Unknown')} | "
            f"{course.get('resource', 'N/A')}\n"
        )

    # Calculate adaptive parameters
    params = calculate_roadmap_params(student_profile)
    total_weeks = params['total_weeks']
    daily_hours = params['daily_hours']
    pace = params['pace']
    study_hours = params['study_hours']

    # Get level-specific prerequisites
    prerequisites = get_prerequisite_topics(
        student_profile.get('current_level', 'beginner'),
        student_profile.get('career_goal', '')
    )
    prereq_text = ", ".join(prerequisites)

    # Format weak topics
    weak_topics = student_profile.get('weak_topics', [])
    if isinstance(weak_topics, list):
        weak_topics_str = ', '.join(weak_topics)
    else:
        weak_topics_str = str(weak_topics)

    # Learning style
    learning_style = student_profile.get('learning_style', 'mixed')

    # Adaptive instructions based on ML prediction
    predicted_cat = student_profile.get('predicted_category', 'Average Learner')
    if predicted_cat == "Needs Learning Support":
        adaptive_note = (
            "ADAPTIVE MODE: Needs Learning Support — "
            "prioritise depth over breadth, add revision weeks every 3-4 weeks, "
            "use guided beginner projects."
        )
    elif predicted_cat == "Career Ready Learner":
        adaptive_note = (
            "ADAPTIVE MODE: Career Ready Learner — "
            "accelerated roadmap, advanced portfolio projects, "
            "integrate industry tools immediately."
        )
    else:
        adaptive_note = "ADAPTIVE MODE: Standard pace."

    # Build the complete prompt
    prompt = f"""You are EduTailor AI, a Personalized Curriculum Architect.

Generate a complete personalized learning roadmap using these ML model outputs:

STUDENT PROFILE:
- Career Goal: {student_profile.get('career_goal', 'Not specified')}
- Predicted Classification: {predicted_cat}
- Confidence Score: {student_profile.get('confidence', 85.0)}%
- Current Skill Level: {student_profile.get('current_level', 'beginner')}
- Weak Topics Detected: {weak_topics_str}
- Engagement Score: {student_profile.get('engagement_score', 0)}
- Assessment Score: {student_profile.get('assessment_score', 0)}
- Study Hours Per Day: {daily_hours}
- Total Weeks: {total_weeks}
- Features Analyzed: 41
- Model Used: Stacking Ensemble (XGBoost + LightGBM + Random Forest)
- Prerequisite Gaps to Address: {prereq_text}

{adaptive_note}

Available Courses Context (use these URLs if appropriate):
{course_text}

ROADMAP RULES:
1. Week 1 MUST start from the weakest detected topic
2. Every week must be a self-contained block with its own project
3. Each course URL must be a real direct link to that exact resource
4. Minimum 3 free courses per week
5. Difficulty must increase progressively week over week
6. Final 2 weeks must be job-ready project weeks targeting {student_profile.get('career_goal', 'Not specified')}
7. Weekly projects must be completable within that week
8. Milestone checkpoints every 4 weeks
9. Prioritize: YouTube, freeCodeCamp, Khan Academy, fast.ai, CS50, Coursera free tier
10. Return ONLY the JSON — nothing else

Required JSON schema:
{{
  "roadmap_title": "string",
  "total_weeks": {total_weeks},
  "weeks": [
    {{
      "week_number": 1,
      "title": "Week 1: <topic name>",
      "focus_area": "string",
      "daily_goal_minutes": 60,
      "topics": [
        {{
          "name": "string",
          "description": "string (1 sentence — what to learn and why)",
          "type": "video | reading | practice | project"
        }}
      ],
      "courses": [
        {{
          "title": "string",
          "platform": "string",
          "url": "string",
          "duration": "string",
          "free": true
        }}
      ],
      "weekly_project": {{
        "title": "string",
        "description": "string",
        "deliverable": "string"
      }},
      "success_criteria": ["string", "string", "string"],
      "difficulty": "Beginner | Intermediate | Advanced"
    }}
  ],
  "milestone_checkpoints": [
    {{
      "after_week": 4,
      "checkpoint_name": "string",
      "assessment": "string (how to self-assess)"
    }}
  ]
}}
"""

    return prompt