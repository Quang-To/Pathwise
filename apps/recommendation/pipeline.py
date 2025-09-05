import json
from typing import Optional
from .embedding import embed_skills
from .map_skill import map_skill
from .recommendation import solve_course_recommendation
from database.db import EmployeeCourse, EmployeeTable
from database.session import get_data, update_data, insert_employee_courses
from schemas.recommendation_schema import UserProfile, CourseRecommendation

def get_employee_field(user_id: str, field: str) -> Optional[str]:
    """Lấy giá trị field của employee theo user_id"""
    rows = get_data(
        schema=EmployeeTable.EMPLOYEE_DATABASE.value,
        table_name=EmployeeTable.EMPLOYEE_TABLE.value
    )
    if not rows:
        print(f"No data found for table {EmployeeTable.EMPLOYEE_TABLE.value}")
        return None

    row = next((r for r in rows if str(r.get(EmployeeTable.EMPLOYEE_ID.value)) == str(user_id)), None)
    if not row:
        print(f"No data found for user_id {user_id}")
        return None

    return row.get(field)


def main(user: UserProfile) -> CourseRecommendation:
    user_id = str(user.user_id)
    update_course = user.update or False

    rows = get_data(
        schema=EmployeeCourse.EMPLOYEE_COURSE_DATABASE.value,
        table_name=EmployeeCourse.EMPLOYEE_COURSE_TABLE.value
    )

    if not update_course and rows:
        existing_row = next(
            (r for r in rows if str(r.get(EmployeeCourse.EMPLOYEE_ID.value)) == user_id), None
        )
        if existing_row:
            courses_data = existing_row[EmployeeCourse.COURSES.value]
            if isinstance(courses_data, str):
                courses_data = json.loads(courses_data)
            return CourseRecommendation(courses=courses_data)

    aspiration = get_employee_field(user_id, EmployeeTable.ASPIRATION.value)
    current_skills_text = get_employee_field(user_id, EmployeeTable.CURRENT_SKILL.value)
    skill_gaps_text = get_employee_field(user_id, EmployeeTable.SKILL_GAP.value)

    if current_skills_text:
        parts = [p.strip() for p in current_skills_text.split(',') if p.strip()]
        current_role = parts[0] if parts else ''
        skills_raw = ",".join(parts[1:])
        existing_skills = [s.strip().lower() for s in skills_raw.replace(';', ',').split(',') if s.strip()]
    else:
        current_role = ''
        existing_skills = []

    skill_gaps = [s.strip() for s in skill_gaps_text.split(',')] if skill_gaps_text else []

    skill_gap_result = map_skill(
        current_occupation=current_role,
        target_occupation=aspiration,
        existing_skills=existing_skills,
        known_missing_skills=skill_gaps
    )

    embedded = embed_skills(skill_gap_result, aspiration)

    result = solve_course_recommendation(
        skill_vectors=embedded,
        missing_skills=skill_gap_result
    )
    course_names = [c["name"] for c in result["recommended_courses"]]
    skill_to_course = result["skill_to_course_map"]

    row_data = {
        EmployeeCourse.EMPLOYEE_ID.value: user_id,
        EmployeeCourse.COURSES.value: json.dumps(course_names),
        EmployeeCourse.COURSE_SKILL.value: json.dumps(skill_to_course)
    }

    existing_row = next((r for r in rows if str(r.get(EmployeeCourse.EMPLOYEE_ID.value)) == user_id), None)
    if existing_row:
        update_data(
            data=[row_data], 
            schema=EmployeeCourse.EMPLOYEE_COURSE_DATABASE.value,
            table_name=EmployeeCourse.EMPLOYEE_COURSE_TABLE.value,
            condition_cols=[EmployeeCourse.EMPLOYEE_ID.value]
        )
    else:
        insert_employee_courses(
            data=[row_data],
        )

    return CourseRecommendation(courses=course_names)