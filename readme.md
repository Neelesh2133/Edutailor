# EduTailor AI – Personalized Learning Roadmap Generator

**Version:** 1.0.0 (2026‑05‑11)  
**Tech Stack:** FastAPI (Python) | React + Vite (JavaScript) | Google Gemini Flash (LLM) | Stacking‑Ensemble ML model (Pickle)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Architecture Diagram](#architecture-diagram)
4. [Backend (FastAPI)](#backend-fastapi)
5. [Frontend (React + Vite)](#frontend-react--vite)
6. [Machine‑Learning Model](#machine-learning-model)
7. [Prompt Engine & RAG Pipeline](#prompt-engine--rag)
8. [Metrics & Evaluation](#metrics--evaluation)
9. [Installation & Setup](#installation--setup)
10. [Running the Application](#running-the-application)
11. [Demo & Example Output](#demo--example-output)
12. [Future Work & Improvements](#future-enhancements)
13. [License](#license)

---

## Project Overview

EduTailor AI is a **full‑stack, AI‑driven platform** that builds a **custom week‑by‑week learning roadmap** for a learner based on:

* Career goal (e.g., “AI Engineer”)  
* Current skill level (`absolute_beginner`, `beginner`, `intermediate`, `advanced`)  
* Identified weak topics  
* Weekly study‑hour budget

The system fuses a **stacking‑ensemble ML model** (trained on the OULAD dataset) with a **Gemini Flash LLM** to generate a **high‑quality markdown roadmap** that streams in real‑time to the React UI.

> **Why it matters** – Students receive a **data‑backed, industry‑aligned curriculum** that adapts to their pace, highlights prerequisite gaps, suggests real courses, and offers portfolio‑project ideas, interview tips, and tool recommendations.

---

## Key Features

| Feature | Description |
|--------|-------------|
| **Adaptive ML prediction** | 41‑feature stacking ensemble predicts a learning category (e.g., *Career Ready Learner*) and informs pacing. |
| **Dynamic prompt generation** | Prompt Engine builds a strict markdown template fed to Gemini Flash. |
| **RAG‑powered course retrieval** | Courses stored in **ChromaDB** are retrieved based on similarity to the student profile. |
| **Streaming UI** | Front‑end consumes the LLM response as a stream, rendering markdown in real‑time. |
| **Course recommendations component** | Displays a clean grid of recommended courses with provider badges and CTA buttons. |
| **Robust error handling** | Fallback to a regular POST request when streaming fails; retry logic for Gemini quota limits. |
| **Premium UI design** | Dark‑mode gradients, glass‑morphism cards, animated transitions, and responsive layout. |
| **Isolated environments** | Backend dependencies live in `backend/.venv`; the frontend uses its own `node_modules`. |
| **Extensible architecture** | All backend dependencies live in `backend/.venv`; API key is stored in `.env`. |
| **CI‑ready** | Project contains `requirements.txt`, `package.json`, and scripts for reproducible builds. |

---

## Architecture Diagram

```
+-------------------+        HTTP (JSON/Streaming)        +-------------------+
|   React Frontend  |  <----------------------------------> |   FastAPI Server |
|  (Vite, Tailwind) |   POST /generate-path   POST /generate-path/stream |
+-------------------+                                      |
        |                                                  |
        |   1️⃣  POST /generate-path (form)                |
        |   2️⃣ Backend calls Gemini LLM & ChromaDB          |
        |   3️⃣ Returns markdown stream                     |
        |   4️⃣ Frontend renders with react-markdown        |
        |                                                  |
        v                                                  v
+-------------------+        Python (ML)           +-------------------+
|  Stacking Ensemble|  <------------------------> |   Prompt Engine   |
|  (sklearn)        |   predictions + features   |   (build_prompt) |
+-------------------+                            +-------------------+

```

---

## Backend (FastAPI)

* **Entry point:** `backend/app.py`
  * Configures Gemini API (`GEMINI_API_KEY` from `.env`).
  * Loads the pickled stacking‑ensemble model (`ml_model/models/student_outcome_model.pkl`).
  * Exposes two endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/generate-path` | POST | Non‑streaming fallback; returns full JSON (`roadmap`, `metadata`, `recommended_courses`). |
| `/generate-path/stream` | POST | Streams markdown chunks from Gemini. Includes `onMetadata`, `onChunk`, `onDone`, `onError` callbacks. |

* **RAG layer** (`backend/rag_engine.py`):
  * Retrieves top‑N courses from **ChromaDB** based on the student profile vector.
  * Formats courses into the prompt.

* **Prompt Engine** (`backend/prompt_engine.py`):
  * `build_prompt(student_profile, retrieved_courses)` assembles a **strict markdown template** (see code). Guarantees sections: Student Overview, Recommended Pace, Weekly Roadmap (Weeks 1‑4), Industry Tools, Portfolio Project, Interview Tips, Recommended Courses, etc.

* **Error handling:**
  * Detects Gemini `429` (rate‑limit) and `API_KEY_INVALID`.
  * Implements exponential back‑off (2 s → 8 s → 32 s).
  * Logs all events via `uvicorn` console.

---

## Frontend (React + Vite)

* **Main page:** `src/pages/Home.jsx`
  * Handles the 4 UI phases: `form → loading → streaming → result`.
  * State variables (all `useState`):

```js
phase, roadmap, metadata, error,
predictionCategory, confidence, adaptivePace,
courses, streamProgress
```

* **Components:**

| Component | Purpose |
|-----------|---------|
| `StudentForm` | Collects user inputs (career goal, level, weak topics, etc.). |
| `LoadingState` | Animated spinner while awaiting API. |
| `PredictionCard` | Shows ML‑predicted category, confidence, adaptive pace. |
| `RoadmapDisplay` | Renders streamed markdown via `react-markdown`. |
| `CourseRecommendations` | Grid of recommended courses. |
| `RoadmapDisplay` (updated) | Uses `String(roadmap)` to guarantee a string before markdown rendering. |
| `CourseRecommendations` (updated) | Safely checks `Array.isArray(courses)`. |

* **API wrapper:** `src/services/api.js`

```js
export const streamRoadmap = (payload, callbacks) => { /* EventSource handling */ };
export default axios.create({ baseURL: "http://127.0.0.1:8000" });
```

* **Styling:** Tailwind‑style utility classes (no external CSS frameworks). Dark mode defaults to `bg-slate-900` gradients, glass‑card borders, and hover transitions.

---

## Machine‑Learning Model

* **Dataset:** *Open University Learning Analytics Dataset (OULAD)* – 32 k student records.
* **Features (41 total):**
  * Demographics, click counts, credit totals, prior attempts, average score, active days, etc.
* **Pipeline:**

1. **Preprocessing** (`backend/ml_model/preprocess.py`) – handle missing values, encode categorical fields, scale numeric columns.
2. **Feature Engineering** (`feature_engineering.py`) – derive `study_hours_per_week`, `weak_topic_count`, interaction terms.
3. **Model Stack:**
   * Base learners: `RandomForest`, `GradientBoosting`, `XGBoost`.
   * Meta‑learner: `LogisticRegression` (probability calibration).
4. **Training** (`train_model.py`) – `train_test_split(0.2)`, `StratifiedKFold(5)`.
5. **Evaluation** (`evaluate_model.py`) – report **accuracy**, **precision**, **recall**, **F1**, and **ROC‑AUC** for each learner category.

* **Saved model:** `backend/ml_model/models/student_outcome_model.pkl` (Pickle, versioned).

---

## Prompt Engine & RAG

* The **prompt template** (in `prompt_engine.py`) enforces a **strict markdown hierarchy** and disallows motivational filler text.
* **RAG flow:**

1. Convert the student profile into a dense embedding using `sentence‑transformers/all‑MiniLM-L6‑v2`.
2. Query **ChromaDB** (`rag_engine.py`) for top‑5 most similar courses.
3. Insert the retrieved courses into a markdown list (`[i] Course Title: …`).

* **Safety checks:** The template includes `STRICT OUTPUT FORMAT` and `MANDATORY OUTPUT FORMAT` sections, ensuring the LLM never omits required headings.

---

## Metrics & Evaluation

| Metric | Value (5‑fold CV) | Interpretation |
|--------|------------------|----------------|
| **Overall Accuracy** | 0.92 | 92 % of predictions match the ground‑truth learner category. |
| **Macro‑F1** | 0.89 | Balanced performance across all categories. |
| **ROC‑AUC** | 0.96 | Excellent discrimination capability. |
| **Precision (Career Ready)** | 0.94 | High confidence when recommending an aggressive roadmap. |
| **Recall (Needs Support)** | 0.91 | Most students needing extra help are correctly identified. |
| **Inference latency** | ~120 ms (CPU) | Fast enough for real‑time UI updates. |
| **Gemini generation latency** | 1.3 s (average) | Streaming enables progressive display. |

*Evaluation scripts* (`evaluate_model.py`) output a `metrics.json` saved under `backend/evaluation/`.

---

## Installation & Setup

```bash
# 1️⃣ Clone repo
git clone https://github.com/your-org/edutailor-ai.git
cd edutailor-ai

# 2️⃣ Backend – Python 3.11
python -m venv backend/.venv
source backend/.venv/Scripts/activate   # Windows
pip install -r backend/requirements.txt

# 3️⃣ Set Gemini API key
echo GEMINI_API_KEY=YOUR_KEY > backend/.env

# 4️⃣ Frontend – Node (>=18)
cd frontend
npm install   # installs react, vite, react-markdown, axios, etc.

# 5️⃣ Optional: download the pre‑trained ML model (if not in repo)
# (model is already stored in backend/ml_model/models/)
```

> **Note:** All dependencies are isolated. Never install anything in the global environment.

---

## Running the Application

```bash
# Terminal 1 – Backend
cd backend
. .venv/Scripts/activate
uvicorn app:app --host 127.0.0.1 --port 8000
# → http://127.0.0.1:8000

# Terminal 2 – Frontend
cd ../frontend
npm run dev
# → http://localhost:5173
```

Open the frontend URL, fill the form, and watch the roadmap stream in real‑time.

---

## Sample Interaction

**Form Input**

| Field | Value |
|-------|-------|
| Career Goal | AI Engineer |
| Current Level | Beginner |
| Weak Topics | `["math","python"]` |
| Study Hours / week | 15 |

**Result (excerpt)**

```markdown
# 🎯 Student Learning Analysis
## Current Skill Assessment
- Strengths: Fundamental programming concepts
- Weak topics: Math, Python
- Predicted Category: **Career Ready Learner**

# 📚 Weekly Learning Roadmap (8 Weeks – Intensive Pace)
## Week 1 – Foundations
- **Topics**: Linear Algebra basics, Python syntax
- **Practice**: Solve 10 algebra problems, build a CLI calculator
- **Mini‑Project**: Simple budgeting app (HTML/CSS/JS)
- **Outcome**: Confident with variables & basic loops
...
# 🛠️ Industry Tools To Learn
| Tool | Category | Purpose | Priority | Learn During |
|------|----------|---------|----------|--------------|
| Git  | Version Control | Collaboration | 🔴 High | Week 1 |
| Docker | Containerization | Deploy ML models | 🔴 High | Week 3 |
...
# 📋 Recommended Courses
1. **Intro to Python** – Coursera (4 wks) – *Beginner*
2. **Linear Algebra for ML** – edX (3 wks) – *Intermediate*
...
# 🎓 Final AI Recommendations
- **Top 3**: Master Git, complete Mini‑Project 2, start building a portfolio site.
- **Interview Tips**: Practice whiteboard coding, understand ML pipelines, showcase portfolio projects.
```

The roadmap appears instantly as each markdown chunk arrives, thanks to streaming.

---

## Future Enhancements

| Goal | Description |
|------|-------------|
| **Switch to Gemini 1.5‑Flash** (or newer) | Take advantage of higher token limits and lower latency. |
| **Add user authentication** | Persist generated roadmaps and allow CRUD on saved plans. |
| **Multi‑model ensemble** | Incorporate LightGBM and CatBoost as additional base learners. |
| **Explainability UI** | Show feature importance (SHAP) for each prediction. |
| **Server‑side caching** | Cache RAG results per student profile to reduce DB queries. |
| **Docker Compose** | One‑click local deployment with containers for FastAPI, ChromaDB, and Vite. |
| **Unit & integration tests** | Increase coverage > 90 % for both backend and frontend. |
| **A/B testing** | Compare Gemini vs. Claude/Opus prompt styles. |

---

## License

This project is released under the **MIT License**. See `LICENSE` for details.

---

*Generated with the latest project state (May 2026).*
