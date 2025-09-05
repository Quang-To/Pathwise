from fastapi import APIRouter, Depends, HTTPException
from schemas.external_courses_schema import ExternalCourseResponse, UserProfile
from access_control.auth import require_admin, User
from apps.external_courses.pipeline import main

router = APIRouter()

@router.get("/external-courses", response_model=ExternalCourseResponse)
def fetch_external_courses(current_user: UserProfile = Depends(require_admin)):
    try:
        main()
        return ExternalCourseResponse(status="Courses fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
