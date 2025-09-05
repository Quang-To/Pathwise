from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    user_id: str
    update: Optional[bool] = False

class LearningDashBoardResponse(BaseModel):
    user_id: str
    learning_goals: List[str]
    recommended_courses: List[str]
    course_id: List[str]
