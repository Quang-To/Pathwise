import json
from typing import Dict, List
from database.db import EmployeeCourse
from schemas.skills_mapping_schema import UserProfile, SkillMappingResponse
from database.session import get_data 


def skills_mapping(user_profile: UserProfile) -> SkillMappingResponse:
    try:
        data_rows = get_data(
            schema=EmployeeCourse.EMPLOYEE_COURSE_DATABASE.value,
            table_name=EmployeeCourse.EMPLOYEE_COURSE_TABLE.value
        )
        if not data_rows:
            return SkillMappingResponse(mappings={})

        user_row = next(
            (row for row in data_rows if row.get(EmployeeCourse.EMPLOYEE_ID.value) == user_profile.user_id),
            None
        )
        if not user_row:
            return SkillMappingResponse(mappings={})

        raw_course_skill = user_row.get(EmployeeCourse.COURSE_SKILL.value)
        if not raw_course_skill:
            return SkillMappingResponse(mappings={})

        if isinstance(raw_course_skill, str):
            course_skill_map: Dict[str, List[str]] = json.loads(raw_course_skill)
        elif isinstance(raw_course_skill, dict):
            course_skill_map: Dict[str, List[str]] = raw_course_skill
        else:
            return SkillMappingResponse(mappings={})

        if not isinstance(course_skill_map, dict):
            return SkillMappingResponse(mappings={})

        return SkillMappingResponse(mappings=course_skill_map)

    except Exception:
        return SkillMappingResponse(mappings={})
