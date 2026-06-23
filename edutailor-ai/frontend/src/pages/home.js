import { useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

export default function Home() {

  const [careerGoal, setCareerGoal] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [weakTopics, setWeakTopics] = useState("");
  const [studyHours, setStudyHours] = useState("");

  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState("");

  const generateRoadmap = async () => {

    setLoading(true);

    try {

      const requestData = {
        career_goal: careerGoal,
        current_level: currentLevel,
        weak_topics: weakTopics.split(","),
        study_hours_per_week: parseInt(studyHours),
        studied_credits: 60,
        num_of_prev_attempts: 1,
        total_clicks: 500,
        avg_score: 75,
        active_days: 30
      };

      const response = await API.post("/generate-path", requestData);

      setRoadmap(response.data.roadmap);

    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  return (

    <div className="min-h-screen bg-slate-950 text-white p-10">

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-center mb-10"
      >
        EduTailor AI
      </motion.h1>

      <div className="max-w-3xl mx-auto bg-slate-900 p-8 rounded-3xl shadow-2xl">

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Career Goal"
            className="w-full p-4 rounded-xl bg-slate-800"
            onChange={(e) => setCareerGoal(e.target.value)}
          />

          <input
            type="text"
            placeholder="Current Skill Level"
            className="w-full p-4 rounded-xl bg-slate-800"
            onChange={(e) => setCurrentLevel(e.target.value)}
          />

          <input
            type="text"
            placeholder="Weak Topics (comma separated)"
            className="w-full p-4 rounded-xl bg-slate-800"
            onChange={(e) => setWeakTopics(e.target.value)}
          />

          <input
            type="number"
            placeholder="Study Hours Per Week"
            className="w-full p-4 rounded-xl bg-slate-800"
            onChange={(e) => setStudyHours(e.target.value)}
          />

          <button
            onClick={generateRoadmap}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 p-4 rounded-xl text-lg font-bold"
          >

            {loading
              ? "Generating AI Roadmap..."
              : "Generate Roadmap"}

          </button>

        </div>

      </div>

      {loading && (

        <div className="text-center mt-10 text-2xl">
          Generating AI Roadmap...
        </div>

      )}

      {roadmap && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-5xl mx-auto mt-10 bg-slate-900 p-10 rounded-3xl"
        >

          <h2 className="text-3xl font-bold mb-5">
            Personalized Learning Path
          </h2>

          <div className="whitespace-pre-wrap leading-8 text-gray-300">
            {roadmap}
          </div>

        </motion.div>

      )}

    </div>
  );
}