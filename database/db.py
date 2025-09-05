from enum import Enum

class Users(str, Enum):
    USER_DATABASE = "access_control_db"
    USER_TABLE = "users"
    USER_ID = "user_id"
    USERNAME = "username"
    FULL_NAME = "full_name"
    EMAIL = "email"
    PASSWORD_HASH = "password_hash"
    IS_ACTIVE = "is_active"
    CREATE_AT = "created_at"
    UPDATE_AT = "updated_at"

class Roles(str, Enum):
    ROLE_DATABASE = "access_control_db"
    ROLE_TABLE = "roles"
    ROLE_ID = "role_id"
    ROLE_NAME = "role_name"
    ROLE_DESCRIPTION = "role_description"

class UserRoles(str, Enum):
    USER_ROLE_DATABASE = "access_control_db"
    USER_ROLE_TABLE = "user_roles"
    USER_ROLE_ID = "user_role_id"
    USER_ID = "user_id"
    ROLE_ID = "role_id"

class COURSERA(str, Enum):
    COURSE_DATABASE = "course"
    COURSES_TABLE = "courses"
    COURSE_ID = "id"
    COURSE_NAME = "name"
    COURSE_DESCRIPTION = "description"
    COURSE_LEVEL = "level"
    COURSE_SKILLS = "skills"
    COURSE_DOMAIN = "domainTypes"
    COURSE_FEEDBACK = "feedback"
    COURSE_URI = "uri"

class MilvusCollection(str, Enum):
    COURSES = "courses_embeddings"
    ESCO = "skill_embeddings"

class ESCOMilvusFields(str, Enum):
    DATA_NAME = "esco"
    URI = "conceptUri"
    SKILL = "preferredLabel"
    ALT_LABELS = "altLabels"
    TYPE = "conceptType"
    SKILL_TYPE = "skillType"
    REUSE_LEVEL = "reuseLevel"
    STATUS = "status"
    DESCRIPTION = "description"
    EMBEDDING = "embedding"

class COURSERAMilvusFields(str, Enum):
    COLLECTION_NAME = "courses_embeddings"
    COURSE_DATABASE = "course"
    COURSE_ID = "id"
    COURSE_NAME = "name"
    COURSE_DESCRIPTION = "description"
    COURSE_LEVEL = "level"
    COURSE_SKILLS = "skills"
    COURSE_DOMAIN = "domainTypes"
    COURSE_FEEDBACK = "feedback"
    COURSE_URI = "uri"
    EMBEDDING = "embedding"

class EmployeeTable(str, Enum):
    EMPLOYEE_DATABASE = "employees"
    EMPLOYEE_TABLE = "employees"
    EMPLOYEE_ID = "employee_id"
    EMPLOYEE_NAME = "employee_name"
    DEPARTMENT_ID = "department_id"
    HIRE_DATE = "hire_date"
    SALARY = "salary"
    CURRENT_SKILL = "current_role_and_competencies"
    ASPIRATION = "career_aspiration"
    SKILL_GAP = "skill_gaps"

class EmployeeCourse(str, Enum):
    EMPLOYEE_COURSE_DATABASE = "employee_course"
    EMPLOYEE_COURSE_TABLE = "employee_courses"
    EMPLOYEE_ID = "employee_id"
    COURSES = "courses"
    COURSE_SKILL = "course_skill"