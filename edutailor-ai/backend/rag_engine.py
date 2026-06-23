import json
import chromadb
from sentence_transformers import SentenceTransformer
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# --- RETRIEVAL ENGINE ---
model = SentenceTransformer('all-MiniLM-L6-v2')
client = chromadb.PersistentClient(path="./chroma_store")
collection = client.get_or_create_collection(name="courses")

def load_courses():
    # Make sure we read from the absolute path if needed, or relative to this script
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "data", "courses.json")
    
    with open(file_path, "r") as file:
        courses = json.load(file)

    existing = collection.count()

    if existing > 0:
        print("Courses already embedded")
        return

    for idx, course in enumerate(courses):
        text = f"""
        Title: {course['title']}
        Description: {course['description']}
        Skills: {', '.join(course['skills'])}
        Career Paths: {', '.join(course['career_paths'])}
        """

        embedding = model.encode(text).tolist()

        # ChromaDB requires metadata values to be string, int, float, or bool.
        # We serialize lists to strings to avoid ValueError.
        safe_course_meta = course.copy()
        safe_course_meta['skills'] = ", ".join(course.get('skills', []))
        safe_course_meta['career_paths'] = ", ".join(course.get('career_paths', []))

        collection.add(
            ids=[str(idx)],
            embeddings=[embedding],
            documents=[text],
            metadatas=[safe_course_meta]
        )

    print("Courses embedded successfully")

def search_courses(query):
    embedding = model.encode(query).tolist()
    results = collection.query(
        query_embeddings=[embedding],
        n_results=3
    )
    return results

# --- GENERATION ENGINE ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
llm_model = genai.GenerativeModel('gemini-2.0-flash')

def generate_learning_path(prompt: str):
    try:
        full_prompt = "You are EduTailor AI, an intelligent academic roadmap generator.\n\n" + prompt
        response = llm_model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2000,
            )
        )
        return response.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return {"error": "Failed to generate learning path from LLM.", "details": str(e)}
