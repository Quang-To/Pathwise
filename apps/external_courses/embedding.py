import time
import json
import random
import logging
from typing import List, Dict, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from google import genai
from google.genai import types
from core.config import Settings
from database.db import COURSERA
import re

# Logger setup
logger = logging.getLogger(__name__)   
logger.setLevel(logging.INFO)

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Disable verbose logs from Google SDKs and HTTP libs
for lib in ["google", "google.generativeai", "google.genai", "httpx", "httpcore"]:
    logging.getLogger(lib).propagate = False
    logging.getLogger(lib).setLevel(logging.CRITICAL)

settings = Settings()
GEMINI_EMBED_MODEL = settings.embedding.GEMINI_EMBED_MODEL
API_KEYS = [
    settings.embedding.KEY_EMBEDDING_1,
    settings.embedding.KEY_EMBEDDING_2,
    settings.embedding.KEY_EMBEDDING_3,
    settings.embedding.KEY_EMBEDDING_4,
]
CLIENTS = [genai.Client(api_key=k) for k in API_KEYS if k]

def _embed_texts_with_retry(
    texts: List[str],
    client: genai.Client,
    task_type: str,
    output_dim: int,
    max_retries: int = 5,
    retry_delay_base: float = 2.0,
    max_retry_delay: float = 60.0
) -> List[List[float]]:
    """
    Embed a list of texts with retry mechanism in case of rate-limiting or transient errors.
    """
    contents = [types.Content(parts=[types.Part(text=text.strip() or "empty text")]) for text in texts]
    embed_config = types.EmbedContentConfig(task_type=task_type, output_dimensionality=output_dim)

    for attempt in range(max_retries):
        try:
            time.sleep(random.uniform(0.05, 0.15))
            response = client.models.embed_content(
                model=GEMINI_EMBED_MODEL,
                contents=contents,
                config=embed_config
            )
            if hasattr(response, "embeddings") and response.embeddings:
                return [e.values for e in response.embeddings]
            return [[] for _ in texts]

        except Exception as e:
            err_msg = str(e).lower()
            if any(kw in err_msg for kw in ["429", "quota", "rate"]):
                wait = min((retry_delay_base ** attempt) * random.uniform(0.8, 1.3), max_retry_delay)
                logger.warning(f"🔁 Rate limited (attempt {attempt+1}/{max_retries}) — retrying in {wait:.1f}s...")
                time.sleep(wait)
            else:
                logger.error(f"Non-retryable error on attempt {attempt+1}: {e}")
                break

    return [[] for _ in texts]

def _process_batch(
    client: genai.Client,
    batch: List[str],
    batch_index: int,
    task_type: str,
    output_dim: int,
    max_retries: int,
    retry_delay_base: float,
    max_retry_delay: float
) -> Tuple[int, List[List[float]]]:
    """
    Process a single batch of texts for embedding.
    """
    vectors = _embed_texts_with_retry(
        batch, client, task_type, output_dim,
        max_retries=max_retries,
        retry_delay_base=retry_delay_base,
        max_retry_delay=max_retry_delay
    )
    return batch_index, vectors

def _embed_parallel(
    texts: List[str],
    task_type: str = settings.embedding.EMBEDDING_CONFIG["task_type"],
    output_dim: int = settings.embedding.EMBEDDING_CONFIG["output_dimensionality"],
    batch_size: int = settings.embedding.EMBEDDING_CONFIG["batch_size"],
    max_workers: int = settings.embedding.EMBEDDING_CONFIG["max_workers"],
    max_retries: int = settings.embedding.EMBEDDING_CONFIG["max_retries"],
    retry_delay_base: float = settings.embedding.EMBEDDING_CONFIG["retry_delay_base"],
    max_retry_delay: float = settings.embedding.EMBEDDING_CONFIG["max_retry_delay"]
) -> List[List[float]]:
    """
    Run embedding in parallel with multiple API keys.
    Prints speed progress every 100 vectors.
    """
    if not texts:
        logger.warning("No texts provided for embedding.")
        return []

    batches = [texts[i:i+batch_size] for i in range(0, len(texts), batch_size)]
    results = [None] * len(batches)

    start_time = time.time()
    processed_vectors = 0

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(
                _process_batch,
                CLIENTS[idx % len(CLIENTS)],
                batch,
                idx,
                task_type,
                output_dim,
                max_retries,
                retry_delay_base,
                max_retry_delay
            )
            for idx, batch in enumerate(batches)
        ]

        for future in as_completed(futures):
            batch_index, vectors = future.result()
            results[batch_index] = vectors
            processed_vectors += len(vectors)

            if processed_vectors % 100 == 0:
                elapsed = time.time() - start_time
                speed = processed_vectors / elapsed
                logger.info(f"Progress: {processed_vectors}/{len(texts)} vectors embedded "
                            f"({speed:.2f} vectors/sec)")

    final_vectors = [vec for batch in results if batch for vec in batch]
    success_count = sum(1 for v in final_vectors if v)
    total_time = time.time() - start_time
    logger.info(f"Embedding completed: {success_count}/{len(texts)} successful in {total_time:.2f}s.")
    return final_vectors

def embed_course_skills(
    data: List[Dict],
    output_dim: int = settings.embedding.EMBEDDING_CONFIG["output_dimensionality"]
) -> List[Dict]:
    """
    Embed skills from course data.
    Returns a list of records where each record has an additional "embedding" field.
    """
    texts = []
    skill_records = []
    skipped_courses = 0

    for course in data:
        course_id = course.get(COURSERA.COURSE_ID)
        course_name = course.get(COURSERA.COURSE_NAME)

        # Skip course if ID or name is missing
        if not course_id or not course_name:
            skipped_courses += 1
            continue

        # Parse skills field
        raw = course.get(COURSERA.COURSE_SKILLS, [])
        if isinstance(raw, str):
            try:
                parsed = json.loads(raw)
                raw = parsed if isinstance(parsed, list) else re.split(r",|;|\||\/", raw)
            except:
                raw = re.split(r",|;|\||\/", raw)

        if not raw or not any(s.strip() for s in raw if isinstance(s, str)):
            skipped_courses += 1
            continue

        # Prepare skill records
        if isinstance(raw, list):
            for skill in raw:
                if isinstance(skill, str) and skill.strip():
                    skill_text = f"Skill: {skill.strip()}"
                    texts.append(skill_text)

                    record = course.copy()
                    record[COURSERA.COURSE_SKILLS] = skill.strip()
                    skill_records.append(record)

    if skipped_courses > 0:
        logger.info(f"⏭ Skipped {skipped_courses} courses without valid info or skills.")

    if not texts:
        logger.warning("No valid skills found for embedding.")
        return []

    vectors = _embed_parallel(texts, output_dim=output_dim)

    for record, vector in zip(skill_records, vectors):
        record["embedding"] = vector

    return skill_records
