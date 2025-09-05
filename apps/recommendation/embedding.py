import time
import random
from typing import List
from google import genai
from google.genai import types
from core.config import Settings

embedding_settings = Settings().embedding
client_main = genai.Client(api_key=embedding_settings.KEY_EMBEDDING_3)
client_fallback = genai.Client(api_key=embedding_settings.KEY_EMBEDDING_4)

def _embed_texts_with_retry(
    texts: List[str],
    client: genai.Client,
    model: str,
    task_type: str,
    output_dim: int,
    max_retries: int,
    retry_base: float,
    retry_max: float
) -> List[List[float]]:
    """Handles embedding with retry mechanism."""
    contents = [
        types.Content(parts=[types.Part(text=text.strip() or "empty text")])
        for text in texts
    ]
    embed_config = types.EmbedContentConfig(
        task_type=task_type,
        output_dimensionality=output_dim
    )

    for attempt in range(max_retries):
        try:
            time.sleep(random.uniform(0.3, 0.6)) 
            response = client.models.embed_content(
                model=model,
                contents=contents,
                config=embed_config
            )
            if response.embeddings:
                return [e.values for e in response.embeddings]
            return [[] for _ in texts]
        except Exception as e:
            err_msg = str(e).lower()
            if any(kw in err_msg for kw in ["429", "quota", "rate"]):
                wait = min((retry_base ** attempt) * random.uniform(0.8, 1.2), retry_max)
                print(f"Rate limit (attempt {attempt + 1}) — retrying in {wait:.1f}s...")
                time.sleep(wait)
            else:
                print(f"Non-retryable error: {e}")
                break
    return [[] for _ in texts]


def _embed_with_fallback(
    texts: List[str],
    config_dict: dict
) -> List[List[float]]:
    """Attempt embedding with main client, fallback if failed."""
    vectors = _embed_texts_with_retry(
        texts=texts,
        client=client_main,
        model=embedding_settings.GEMINI_EMBED_MODEL,
        task_type=config_dict["task_type"],
        output_dim=config_dict["output_dimensionality"],
        max_retries=config_dict["max_retries"],
        retry_base=config_dict["retry_delay_base"],
        retry_max=config_dict["max_retry_delay"]
    )

    if all(len(v) == 0 for v in vectors):
        print("Using fallback client...")
        vectors = _embed_texts_with_retry(
            texts=texts,
            client=client_fallback,
            model=embedding_settings.GEMINI_EMBED_MODEL,
            task_type=config_dict["task_type"],
            output_dim=config_dict["output_dimensionality"],
            max_retries=config_dict["max_retries"],
            retry_base=config_dict["retry_delay_base"],
            retry_max=config_dict["max_retry_delay"]
        )

    return vectors

def embed_skills(
    skills: List[str],
    aspiration: str = "",
    config_dict: dict = embedding_settings.EMBEDDING_CONFIG,
    use_batch: bool = True
) -> List[List[float]]:
    if not skills:
        print("No skills to embed.")
        return []

    normalized_skills = [skill.strip().lower() for skill in skills if skill.strip()]

    if aspiration:
        skills_with_context = [f"Skills: {skill}" for skill in normalized_skills]
    else:
        skills_with_context = normalized_skills

    results = []

    if use_batch:
        batch_size = config_dict.get("batch_size", 24)
        for i in range(0, len(skills_with_context), batch_size):
            batch = skills_with_context[i:i + batch_size]
            print(f"Processing batch {i}–{i + len(batch) - 1}")
            vectors = _embed_with_fallback(batch, config_dict)
            results.extend(vectors)
    else:
        for i, skill in enumerate(skills_with_context):
            print(f"Embedding skill {i + 1}/{len(skills_with_context)}: {skill}")
            vector = _embed_with_fallback([skill], config_dict)[0]
            results.append(vector)

    success_count = sum(1 for v in results if v)
    print(f"Done: {success_count}/{len(skills)} embedded successfully.")
    return results
