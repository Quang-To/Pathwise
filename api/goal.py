from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from schemas.goal_schema import UserProfile, SetGoalResponse
from apps.goal.set import set_goal
from access_control.auth import require_employee, User

router = APIRouter()

class GoalRequest(BaseModel):
    aspiration: str

@router.post("/set", response_model=SetGoalResponse)
def set_learning_goal(
    goal_request: GoalRequest,
    current_user: User = Depends(require_employee)
):
    """
    Set learning goal for the authenticated user.
    """
    aspiration = goal_request.aspiration.strip()
    if not aspiration:
        raise HTTPException(status_code=400, detail="Aspiration (goal) cannot be empty")

    try:
        user_profile = UserProfile(
            user_id=current_user.user_id,
            aspiration=aspiration
        )
        return set_goal(user_profile)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
