from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from rag_engine import load_courses, search_courses
from prompt_engine import build_prompt, calculate_roadmap_params
from courses_data import COURSES

import google.generativeai as genai
import os
import time
import json
import asyncio
import joblib
import pandas as pd
import numpy as np

from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-flash-latest")

# Load ML Prediction Model
prediction_model = joblib.load(
    "ml_model/models/student_outcome_model.pkl"
)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EduTailor AI",
    description="AI-Powered Personalized Curriculum Architect",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_courses()

class StudentProfile(BaseModel):
    career_goal: str
    current_level: str
    weak_topics: List[str]
    study_hours_per_week: int
    studied_credits: int
    num_of_prev_attempts: int
    total_clicks: int
    avg_score: float
    active_days: int
    learning_style: Optional[str] = "mixed"

@app.get("/")
def home():
    return {
        "message": "EduTailor AI Running",
        "version": "3.0.0",
        "status": "healthy"
    }

@app.post("/generate-path")
def generate_path(profile: StudentProfile):
    """Generate a comprehensive personalized learning roadmap."""

    start_time = time.time()

    # Build RAG query with enriched context
    query = f"""
    Career Goal: {profile.career_goal}
    Current Level: {profile.current_level}
    Weak Topics: {', '.join(profile.weak_topics)}
    Learning Style: {profile.learning_style}
    """

    # Build full 41-feature payload (impute defaults for unknowns)
    # Import locally to avoid circular dependency
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), "ml_model"))
    from feature_engineering import FEATURE_COLS
    
    # Initialize dictionary with default 0 for all features
    base_dict = {col: 0 for col in FEATURE_COLS}
    
    # Overwrite known features from profile
    base_dict['studied_credits'] = profile.studied_credits
    base_dict['num_prev_attempts'] = profile.num_of_prev_attempts
    base_dict['total_clicks'] = profile.total_clicks
    base_dict['avg_score'] = profile.avg_score
    base_dict['active_days'] = profile.active_days
    
    prediction_input = pd.DataFrame([base_dict])[FEATURE_COLS]

    prediction = prediction_model.predict(prediction_input)

    success_level = int(prediction[0]) 

    success_mapping = {
        0: "Needs Learning Support",
        1: "Career Ready Learner"
    }

    predicted_category = success_mapping.get(
        success_level,
        "Average Learner"
    )

    # Calculate confidence percentage (0‑100) and adaptive pacing
    confidence = round(
        float(max(prediction_model.predict_proba(prediction_input)[0])) * 100,
        2
    )

    adaptive_pace = (
        "Accelerated"
        if predicted_category == "Career Ready Learner"
        else "Foundation Focused"
    )

    # Search for relevant courses via RAG
    results = search_courses(query)
    retrieved_courses = COURSES.get(profile.career_goal, [])

    # Run ML Prediction
    profile_dict = profile.dict()
    
    if success_level == 1:
        difficulty = "Accelerated pace, high complexity, challenging"
        success_prob = 0.95
    else:
        difficulty = "Reduced pace, highly foundational, extremely supportive"
        success_prob = 0.3

    profile_dict["success_probability"] = success_prob
    profile_dict["recommended_difficulty"] = difficulty
    
    profile_data = profile_dict
    profile_data["predicted_category"] = predicted_category

    # Build the enhanced prompt
    prompt = build_prompt(profile_data, retrieved_courses)

    # Calculate roadmap parameters for metadata
    params = calculate_roadmap_params(profile_dict)

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.75,
                max_output_tokens=16384,
                top_p=0.95,
                top_k=40,
            )
        )

        generation_time = round(time.time() - start_time, 2)

        return {
            "predicted_category": predicted_category,
            "confidence": confidence,
            "adaptive_pace": adaptive_pace,
            "roadmap": response.text,
            "recommended_courses": [
                {
                    "title": c.get("title", ""),
                    "description": c.get("description", ""),
                    "provider": c.get("provider", ""),
                    "duration": c.get("duration", ""),
                    "resource": c.get("resource", "")
                }
                for c in retrieved_courses
            ]
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"AI generation failed: {str(e)}. Please try again."
        )


@app.post("/generate-path/stream")
async def generate_path_stream(profile: StudentProfile):
    """Stream the roadmap generation for real-time UI updates."""

    # Build RAG query
    query = f"""
    Career Goal: {profile.career_goal}
    Current Level: {profile.current_level}
    Weak Topics: {', '.join(profile.weak_topics)}
    Learning Style: {profile.learning_style}
    """

    results = search_courses(query)
    retrieved_courses = results["metadatas"][0]

    # Run ML Prediction using Stacking Ensemble (41 features)
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), "ml_model"))
    from feature_engineering import FEATURE_COLS
    
    # Initialize dictionary with default 0 for all features
    base_dict = {col: 0 for col in FEATURE_COLS}
    
    # Overwrite known features from profile
    base_dict['studied_credits'] = profile.studied_credits
    base_dict['num_prev_attempts'] = profile.num_of_prev_attempts
    base_dict['total_clicks'] = profile.total_clicks
    base_dict['avg_score'] = profile.avg_score
    base_dict['active_days'] = profile.active_days
    
    prediction_input = pd.DataFrame([base_dict])[FEATURE_COLS]
    
    try:
        # Get probability of success (class 1: 'Career Ready Learner')
        success_prob = float(prediction_model.predict_proba(prediction_input)[0][1])
    except Exception as e:
        print(f"ML Prediction Error: {e}")
        success_prob = 0.5

    if success_prob < 0.4:
        difficulty = "Reduced pace, highly foundational, extremely supportive"
    elif success_prob < 0.7:
        difficulty = "Standard adaptive pace"
    else:
        difficulty = "Accelerated pace, high complexity, challenging"

    profile_dict = profile.dict()
    profile_dict["success_probability"] = success_prob
    profile_dict["recommended_difficulty"] = difficulty
    
    # Calculate categories for frontend mapping
    predicted_category = "Career Ready Learner" if success_prob > 0.5 else "Needs Learning Support"
    confidence = round(success_prob * 100 if success_prob > 0.5 else (1 - success_prob) * 100, 2)
    adaptive_pace = "Accelerated" if predicted_category == "Career Ready Learner" else "Foundation Focused"


    prompt = build_prompt(profile_dict, retrieved_courses)
    params = calculate_roadmap_params(profile_dict)

    async def stream_response():
        try:
            # Send metadata first
            metadata = {
                "type": "metadata",
                "data": {
                    "model_used": "gemini-flash-latest",
                    "courses_matched": len(retrieved_courses),
                    "roadmap_weeks": params['total_weeks'],
                    "pace": params['pace'],
                    "daily_hours": params['daily_hours'],
                    "recommended_courses": retrieved_courses,
                    "student_profile": profile.dict(),
                    "predicted_category": predicted_category,
                    "confidence": confidence,
                    "adaptive_pace": adaptive_pace,
                }
            }
            yield f"data: {json.dumps(metadata)}\n\n"

            # Stream the AI response
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.75,
                    max_output_tokens=16384,
                    top_p=0.95,
                    top_k=40,
                ),
                stream=True,
            )

            for chunk in response:
                if chunk.text:
                    chunk_data = {
                        "type": "chunk",
                        "data": chunk.text
                    }
                    yield f"data: {json.dumps(chunk_data)}\n\n"
                    await asyncio.sleep(0)  # Yield control

            # Send completion signal
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            print(f"STREAM EXCEPTION: {e}")
            error_data = {
                "type": "error",
                "data": str(e)
            }
            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "EduTailor AI Backend", "version": "3.0.0"}