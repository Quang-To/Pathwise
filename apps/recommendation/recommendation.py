import ast
from typing import List, Dict
from pymilvus import Collection
from ortools.sat.python import cp_model
from database.db import COURSERAMilvusFields
from database.session import connect_milvus
from core.config import Settings

# Load config settings
recommendation = Settings().recommendation


def get_similar_courses(vector_skill, top_k=10000, threshold=None) -> List[Dict]:
    """
    Find the most relevant courses based on a given similarity threshold.
    """
    threshold = threshold or recommendation.UPPER_THRESHOLD
    collection = Collection(name=COURSERAMilvusFields.COLLECTION_NAME.value)
    collection.load()

    search_params = {
        "metric_type": "COSINE",
        "params": {"nprobe": 10},
    }

    results = collection.search(
        data=[vector_skill],
        anns_field=COURSERAMilvusFields.EMBEDDING.value,
        param=search_params,
        limit=top_k,
        output_fields=[
            COURSERAMilvusFields.COURSE_ID.value,
            COURSERAMilvusFields.COURSE_NAME.value,
            COURSERAMilvusFields.COURSE_DESCRIPTION.value,
            COURSERAMilvusFields.COURSE_SKILLS.value,
            COURSERAMilvusFields.COURSE_LEVEL.value,
            COURSERAMilvusFields.COURSE_FEEDBACK.value,
        ],
    )

    top_results = []
    for hits in results:
        for hit in hits:
            if hit.distance >= threshold:
                try:
                    raw_skills = hit.entity.get(COURSERAMilvusFields.COURSE_SKILLS.value)
                    parsed_skills = (
                        ast.literal_eval(raw_skills)
                        if isinstance(raw_skills, str) and raw_skills.startswith("[")
                        else raw_skills
                    )
                    course_skills = [s.strip() for s in parsed_skills if isinstance(s, str)]
                except Exception:
                    course_skills = []

                top_results.append({
                    "id": hit.entity.get(COURSERAMilvusFields.COURSE_ID.value),
                    "name": hit.entity.get(COURSERAMilvusFields.COURSE_NAME.value),
                    "description": hit.entity.get(COURSERAMilvusFields.COURSE_DESCRIPTION.value),
                    "skills": course_skills,
                    "level": hit.entity.get(COURSERAMilvusFields.COURSE_LEVEL.value),
                    "feedback": hit.entity.get(COURSERAMilvusFields.COURSE_FEEDBACK.value),
                    "similarity": round(hit.distance, 4),
                })
    return top_results


def solve_course_recommendation(skill_vectors: List, missing_skills: List[str]) -> Dict:
    """
    Optimize course selection to cover all missing skills with the minimal number of courses.
    Dynamically adjusts similarity threshold from upper down to lower in steps.
    """
    connect_milvus()

    skill_to_courses: Dict[str, set] = {}
    all_courses: Dict[str, Dict] = {}

    upper = recommendation.UPPER_THRESHOLD
    lower = recommendation.LOWER_THRESHOLD
    step = recommendation.STEP_THRESHOLD

    for vector, skill in zip(skill_vectors, missing_skills):
        threshold = upper
        similar_courses = []

        # Dynamically lower the threshold until matches are found or hit lower bound
        while threshold >= lower and not similar_courses:
            similar_courses = get_similar_courses(vector, threshold=threshold)
            if not similar_courses:
                threshold -= step

        if not similar_courses:
            continue

        skill_lc = skill.lower()
        skill_to_courses.setdefault(skill_lc, set())

        for course in similar_courses:
            course_id = course["id"]
            all_courses[course_id] = course
            skill_to_courses[skill_lc].add(course_id)

    # Build optimization model
    course_list = list(all_courses.values())
    course_id_to_index = {c["id"]: i for i, c in enumerate(course_list)}

    missing_skills_lc = [s.lower() for s in missing_skills]
    skill_index = {skill: idx for idx, skill in enumerate(missing_skills_lc)}

    model = cp_model.CpModel()
    course_vars = [model.NewBoolVar(f"course_{i}") for i in range(len(course_list))]
    skill_covered = [model.NewBoolVar(f"skill_{i}") for i in range(len(missing_skills_lc))]

    for skill, skill_idx in skill_index.items():
        relevant_ids = skill_to_courses.get(skill, set())
        relevant_vars = [course_vars[course_id_to_index[cid]] for cid in relevant_ids]
        if relevant_vars:
            model.AddMaxEquality(skill_covered[skill_idx], relevant_vars)
            model.Add(skill_covered[skill_idx] == 1)
        else:
            print(f"No courses cover the skill: {skill}")

    model.Minimize(sum(course_vars))

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        print("No optimal or feasible solution found.")
        return {"recommended_courses": [], "skill_to_course_map": {}}

    # Collect selected courses
    selected_ids = {course_list[i]["id"] for i, var in enumerate(course_vars) if solver.Value(var)}
    selected_courses = [c for c in course_list if c["id"] in selected_ids]

    # Map skills to selected courses
    final_skill_map = {
        skill: [
            all_courses[cid]["name"]
            for cid in skill_to_courses.get(skill.lower(), set())
            if cid in selected_ids
        ]
        for skill in missing_skills
    }

    return {
        "recommended_courses": selected_courses,
        "skill_to_course_map": final_skill_map,
    }
