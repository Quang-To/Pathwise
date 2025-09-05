from database.session import get_data
from database.db import EmployeeTable, EmployeeCourse, COURSERA
import json
from schemas.learning_dashboard_schema import UserProfile, LearningDashBoardResponse
from apps.recommendation.pipeline import main  


def get_course_ids_by_names(course_names: list[str]) -> list[str]:
    """Retrieval course_id from Postgres based on course_name list"""
    course_rows = get_data(
        schema=COURSERA.COURSE_DATABASE.value,
        table_name=COURSERA.COURSES_TABLE.value
    )

    name_to_id = {
        row.get(COURSERA.COURSE_NAME.value): row.get(COURSERA.COURSE_ID.value)
        for row in course_rows
    }

    course_ids = [name_to_id.get(name, "") for name in course_names]
    return course_ids


def learning_dashboard(user_profile: UserProfile) -> LearningDashBoardResponse:
    user_id = user_profile.user_id
    try:
        user_id_casted = int(user_id)
    except ValueError:
        user_id_casted = str(user_id)

    employee_rows = get_data(
        schema=EmployeeTable.EMPLOYEE_DATABASE.value,
        table_name=EmployeeTable.EMPLOYEE_TABLE.value
    )
    employee_row = next(
        (r for r in employee_rows if r.get(EmployeeTable.EMPLOYEE_ID.value) == user_id_casted),
        None
    )
    if not employee_row:
        raise Exception(f"User {user_id} not found in employee table")

    aspiration_raw = employee_row.get(EmployeeTable.ASPIRATION.value) or ""
    learning_goals = [goal.strip() for goal in aspiration_raw.split(",") if goal.strip()]

    course_rows = get_data(
        schema=EmployeeCourse.EMPLOYEE_COURSE_DATABASE.value,
        table_name=EmployeeCourse.EMPLOYEE_COURSE_TABLE.value
    )
    course_row = next(
        (r for r in course_rows if r.get(EmployeeCourse.EMPLOYEE_ID.value) == user_id_casted),
        None
    )

    if course_row:
        courses_raw = course_row.get(EmployeeCourse.COURSES.value) or "[]"
        try:
            recommended_courses = json.loads(courses_raw)
        except json.JSONDecodeError:
            recommended_courses = []
    else:
        rec_result = main(user_profile)
        recommended_courses = rec_result.courses

    course_ids = get_course_ids_by_names(recommended_courses)

    return LearningDashBoardResponse(
        user_id=user_id,
        learning_goals=learning_goals,
        recommended_courses=recommended_courses,
        course_id=course_ids
    )
