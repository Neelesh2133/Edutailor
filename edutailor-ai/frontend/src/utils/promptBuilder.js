// Utility function to build the prompt for EduTailor AI roadmap generation
// This function is auto‑injected as per user request – it should be used after the ML model returns results.

export function buildUserPrompt(mlResult, formData) {
  return `
    Generate a complete personalized learning roadmap for this student:

    - Career Goal: ${formData.career_goal}
    - Current Skill Level: ${mlResult.predicted_class}
    - Weak Topics: ${mlResult.weak_topics.join(', ')}
    - Study Hours Per Day: ${formData.hours_per_day}
    - Total Weeks: 14
    - Predicted Classification: ${mlResult.classification_label}
    - Confidence Score: ${mlResult.confidence}%
    - Features Analyzed: ${mlResult.feature_count}

    Generate the full roadmap in the exact JSON format specified.
  `;
}
