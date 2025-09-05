import os
import time
import random
import json
import requests
import pandas as pd
from bs4 import BeautifulSoup
from langdetect import detect
from concurrent.futures import ThreadPoolExecutor, as_completed
from database.db import COURSERA
from core.config import Settings

settings = Settings()

# ====== HTTP SESSION & HEADERS ======
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/113.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/112.0.0.0 Safari/537.36",
]

session = requests.Session()
session.headers.update({
    "User-Agent": random.choice(USER_AGENTS),
    "Accept-Encoding": "gzip, deflate, br"
})

# ====== CACHE SKILLS ======
CACHE_FILE = "skills_cache.json"
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        skills_cache = json.load(f)
else:
    skills_cache = {}


def print_log(msg: str):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}")


def extract_skills_from_slug(slug: str, domain_types: list) -> list[str]:
    """Get skills from course or specialization page"""
    if not slug or not domain_types:
        return []

    if slug in skills_cache:
        return skills_cache[slug]

    is_specialization = any(d.get("domainType") == "SPECIALIZATION" for d in domain_types)
    url = f"https://www.coursera.org/specializations/{slug}" if is_specialization else f"https://www.coursera.org/learn/{slug}"

    try:
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        resp = session.get(url, headers=headers, timeout=10)

        if resp.status_code in (403, 429):
            wait_time = 30 if resp.status_code == 429 else 10
            print_log(f"HTTP {resp.status_code} - chờ {wait_time}s trước khi thử lại: {url}")
            time.sleep(wait_time)
            return []

        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        skill_selectors = [
            "span.css-o5tswl",
            "span.css-1l1jvyr a",
            '[data-testid="skill-tag"]',
            "a[data-click-key*='seo_skills_link_tag']"
        ]

        skills = []
        for selector in skill_selectors:
            skills.extend([el.get_text(strip=True) for el in soup.select(selector)])

        skills = list(set(skills))
        skills_cache[slug] = skills

        return skills
    except Exception as e:
        print_log(f"Fail to get skill from {url}: {e}")
        return []


def fetch_course_data(course, coursera_cols):
    """Process a course into a clean data dict"""
    lang = course.get("language", "")
    desc = course.get("description", "")

    if lang and not (lang.startswith("en") or lang.startswith("vi")):
        return None

    try:
        if desc and detect(desc) not in ["vi", "en"]:
            return None
    except Exception:
        pass

    row = {col.value: course.get(col.value, None) for col in coursera_cols if col.value != "skills"}

    slug = course.get("slug")
    domain_types = course.get("domainTypes", [])
    skills = extract_skills_from_slug(slug, domain_types) if slug else []
    row["skills"] = ", ".join(skills) if skills else None

    for k, v in row.items():
        if isinstance(v, (dict, list)):
            row[k] = json.dumps(v, ensure_ascii=False)

    return row


def collect_courses_data() -> pd.DataFrame:
    """Collect course data from Coursera API"""
    all_courses = []
    start = 0
    url = settings.coursera.URI
    if not url:
        raise EnvironmentError("URI_COURSERA had not config yet")

    target_raw = settings.coursera.TARGET
    target = None if str(target_raw).lower() == "full" else int(target_raw)
    limit = settings.coursera.LIMIT
    max_retries = settings.coursera.MAX_RETRIES
    api_fields = settings.coursera.FIELD

    coursera_cols = list(COURSERA)[2:]

    while True:
        if target is not None and len(all_courses) >= target:
            break

        params = {
            "fields": ",".join(api_fields),
            "start": start,
            "limit": limit
        }

        for attempt in range(max_retries):
            try:
                response = session.get(url, params=params, timeout=15)

                if response.status_code in (403, 429):
                    wait_time = 60 if response.status_code == 429 else 10
                    print_log(f"HTTP {response.status_code} - chờ {wait_time}s...")
                    time.sleep(wait_time)
                    continue

                response.raise_for_status()
                data = response.json()
                break
            except Exception as e:
                wait = min(5, 2 ** attempt)
                print_log(f"Try ({attempt+1}/{max_retries}) after {wait}s: {e}")
                time.sleep(wait)
        else:
            raise RuntimeError(f"Consecutive error {max_retries} at start={start}")

        elements = data.get("elements", [])
        if not elements:
            break

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(fetch_course_data, c, coursera_cols) for c in elements]
            for future in as_completed(futures):
                row = future.result()
                if row:
                    all_courses.append(row)

        print_log(f"Batch {start}-{start+limit}: Collected {len(elements)} courses, "
                  f"Total {len(all_courses)} courses saved.")

        start += limit

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(skills_cache, f, ensure_ascii=False, indent=2)

    df = pd.DataFrame(all_courses)

    final_cols = [c.value for c in COURSERA if c.value != "skills"] + ["skills"]
    for col in final_cols:
        if col not in df.columns:
            df[col] = None

    df = df.loc[:, ~df.columns.duplicated(keep='last')]

    return df[final_cols]
