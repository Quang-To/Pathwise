from fastapi import APIRouter, HTTPException, Depends, Query
from schemas.feedback_schema import FeedBackResponse, InputFeedBack
from access_control.auth import require_employee, User
from apps.feedback.feedback import add_feedback
from apps.learning_dashboard.learning_dashboard import learning_dashboard 
from schemas.learning_dashboard_schema import UserProfile

router = APIRouter()

@router.post("/feedback", response_model=FeedBackResponse)
def give_feedback(
    course_id: str = Query(..., description="Course ID"),
    feedback: str = Query(..., description="Your feedback"),
    current_user: User = Depends(require_employee)
):
    try:
        dashboard = learning_dashboard(UserProfile(user_id=current_user.user_id))
        allowed_course_ids = dashboard.course_id

        if course_id not in allowed_course_ids:
            raise HTTPException(
                status_code=403,
                detail="You dont have permission to access to this course"
            )
        return add_feedback(InputFeedBack(user_id=current_user.user_id, course_id=course_id, feedback=feedback))

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sever Error {str(e)}")
