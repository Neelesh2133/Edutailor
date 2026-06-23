# EduTailor AI: Technical Workflow & Architecture

EduTailor AI is an advanced, adaptive learning platform that combines **Predictive Machine Learning**, **Retrieval-Augmented Generation (RAG)**, and **Large Language Models (LLMs)** to create clinically personalized learning roadmaps.

## 🔄 Detailed End-to-End Workflow

### 1. Data Ingestion (Frontend)
The process begins when a student provides their profile via the React frontend.
- **Inputs Captured**: Career goal (e.g., Data Scientist), current skill level (e.g., Beginner), weak topics (e.g., Python, Statistics), and availability (e.g., 2 hours/day).
- **Behavioral Data**: In a production environment, it also captures engagement metrics like previous credits, total clicks, assessment scores, and active days.

### 2. The ML Diagnostic Layer (The "Brain")
Before any content is generated, the backend (`app.py`) passes the raw student data to a **Stacking Ensemble ML Model**.
- **Model Architecture**: A robust stacking classifier combining XGBoost, LightGBM, and Random Forest base learners, with a Logistic Regression meta-learner. It was trained on the OULAD dataset.
- **Process**:
    - Analyzes **41 distinct features** derived from the student's profile and historical behavior.
    - Predicts the **Student Outcome** (Fail/Withdraw vs. Pass/Distinction).
    - Calculates a **Success Probability** (Confidence Score).
- **Output & Use Case**: Produces an "Adaptive Strategy." If the model predicts the student is at risk of failing (*Needs Learning Support*), it dials down the roadmap's pace, increases the total weeks, and focuses heavily on foundations. If predicted to succeed (*Career Ready Learner*), the roadmap accelerates into advanced projects.

### 3. Contextual Retrieval (RAG Engine)
While the ML model is diagnosing the student, the **RAG Engine** (`rag_engine.py`) prepares the educational resources.
- **Process**:
    - Takes the student's **Career Goal** and **Weak Topics**.
    - Performs a semantic search against a **ChromaDB** vector store containing curated course metadata (e.g., Coursera, freeCodeCamp links).
- **Output & Use Case**: Retrieves a list of the most relevant courses, tutorials, and documentation links tailored to the student's specific goal, preventing the LLM from hallucinating fake courses.

### 4. Adaptive Prompt Engineering
The **Prompt Engine** (`prompt_engine.py`) assembles all the pieces into a high-context master prompt.
- **Injected Data**:
    - The ML Diagnosis (Pace, Difficulty, Success Probability).
    - The RAG Results (Curated course URLs).
    - The Student Constraints (Study hours per day, total weeks).
- **Formatting Constraints**: Enforces a strict JSON schema and "No Prose" rule to ensure the output is machine-readable for the UI.

### 5. Content Synthesis (Gemini API)
The assembled prompt is sent to the generative AI model (e.g., Gemini 3 Flash / Gemini 3.1 Pro).
- **Role**: Gemini acts as the "Content Architect." It leverages its vast knowledge graph to break down the broader goal into bite-sized weekly topics.
- **Constraint Compliance**: It strictly follows the ML-driven pacing. It designs weekly projects and sets success criteria that directly align with the difficulty level dictated by the ML model.
- **Use Case**: To write the actual human-readable curriculum, create project ideas (e.g., "Build a CLI calculator"), and logically sequence the topics week-by-week.

### 6. Dynamic Rendering (Frontend)
The backend streams or returns the pure JSON payload to the React frontend.
- **Processing**: The `RoadmapDisplay.jsx` component safely parses the JSON, handling any potential structure deviations.
- **Display**: It renders a vibrant, interactive UI with:
    - Weekly focus blocks.
    - Progressively increasing difficulty badges.
    - Clickable course links.
    - Milestone checkpoints.

---

## 🛠 Summary of Component Use Cases

| Component | Use Case & Responsibility | Analogous To |
| :--- | :--- | :--- |
| **Stacking ML Model** | Analyzes behavior & predicts risk/success to dictate pacing and difficulty. | **The Doctor** (Diagnoses the student's needs) |
| **RAG Engine** | Finds specific, verified course URLs to prevent hallucinations. | **The Librarian** (Finds the right books/tools) |
| **Gemini AI** | Structures topics, designs projects, and writes descriptions based on instructions. | **The Professor** (Designs the syllabus & exercises) |
| **React UI** | Visualizes the roadmap beautifully and interactively for the end-user. | **The Classroom** (The environment where learning happens) |

## 🚀 Why this "Hybrid" approach?
If we used **only Gemini**, the roadmap would be generic, uncalibrated to the student's actual learning capacity, and prone to hallucinating course links.
If we used **only ML**, we would have a probability prediction but no actual study plan or content.
**By combining them**, EduTailor AI delivers a roadmap that is both **scientifically accurate** (paced according to data) and **educationally rich** (authored by generative AI).
