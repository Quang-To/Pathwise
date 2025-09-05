import json
import re
from typing import List
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from core.config import Settings

embedding_settings = Settings().embedding
generate = Settings().generate

genai.configure(api_key=generate.KEY_GEN_1)

def clean_json_text(text: str) -> str:
    text = re.sub(r"```(json)?", "", text, flags=re.IGNORECASE).strip("` \n")
    return text.strip()

def try_generate(prompt: str, keys: List[str]) -> str:
    for key in keys:
        try:
            model = genai.GenerativeModel(generate.GEMINI_GENERATE_MODEL)
            response = model.generate_content(prompt)
            return clean_json_text(response.text.strip())
        except ResourceExhausted:
            print(f"API key quota exceeded: {key[:10]}... Trying next key.")
        except Exception as e:
            print("Unexpected error:", e)
    return ""

def map_skill(
    current_occupation: str,
    target_occupation: str,
    existing_skills: List[str],
    known_missing_skills: List[str]
) -> List[str]:
    """
    Generate a list of recommended skills to transition from current_occupation to target_occupation.
    """
    prompt = f"""
    You are a professional career advisor.

    Your task is to recommend the **most relevant skills** a person should learn to transition from one job to another.

    Return a JSON object with:
    - "main_skills" (a list of skills — length can vary depending on relevance)

    ⚠️ Rules:
    - Return only unique, clear, and job-relevant skills.
    - Include at least one skill reflecting **current industry trends** 
      (e.g., AI, data literacy, remote tools, cybersecurity, sustainability, etc.).
    - Do not include explanations or markdown.
    - Format strictly as:
    [
    {{
        "main_skills": ["Skill A", "Skill B", "Skill C", ...]
    }}
    ]

    Person info:
    - Current occupation: "{current_occupation}"
    - Target occupation: "{target_occupation}"
    - Existing skills: {existing_skills}
    - Known missing skills: {known_missing_skills}
    """.strip()

    text = try_generate(prompt, keys=[embedding_settings.KEY_EMBEDDING_1, embedding_settings.KEY_EMBEDDING_2])
    if not text:
        return ["[Out of computing resourses]"]

    try:
        results = json.loads(text)
        if isinstance(results, list) and isinstance(results[0], dict):
            skills = results[0].get("main_skills", [])
            if isinstance(skills, list) and len(skills) > 0:
                return skills
    except Exception:
        pass

    try:
        match = re.search(r'"main_skills"\s*:\s*\[(.*?)\]', text, re.DOTALL)
        if match:
            raw_skills = match.group(1)
            skills = [s.strip(' "\'\n') for s in raw_skills.split(",")]
            skills = [s for s in skills if s]  
            if len(skills) > 0:
                return skills
    except Exception:
        pass

    fallback_skills = [line.strip("-•* ").strip('" ') for line in text.splitlines() if line.strip()]
    fallback_skills = list(dict.fromkeys(fallback_skills))  
    return fallback_skills[:10] 
