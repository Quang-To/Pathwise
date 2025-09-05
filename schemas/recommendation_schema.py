from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    user_id: str
    update: Optional[bool] = False

class CourseRecommendation(BaseModel):
    courses: List[str]
