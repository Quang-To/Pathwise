from fastapi import APIRouter, HTTPException, Depends
from schemas.recommendation_schema import UserProfile, CourseRecommendation
from apps.recommendation.pipeline import main
from access_control.auth import require_employee, User

router = APIRouter()

@router.post("/recommend-courses", response_model=CourseRecommendation)
def recommend_courses(
    current_user: User = Depends(require_employee) 
):
    try:
        user_profile = UserProfile(user_id=current_user.user_id, update=False)
        return main(user_profile)

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
