from fastapi import APIRouter, HTTPException, Depends
from schemas.learning_dashboard_schema import UserProfile, LearningDashBoardResponse
from apps.learning_dashboard.learning_dashboard import learning_dashboard
from access_control.auth import require_employee, User

router = APIRouter()

@router.get("/learning-dashboard", response_model=LearningDashBoardResponse)
def get_learning_dashboard(
    current_user: User = Depends(require_employee)
):
    try:
        user_profile = UserProfile(user_id=current_user.user_id, update=False)
        
        return learning_dashboard(user_profile)

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
