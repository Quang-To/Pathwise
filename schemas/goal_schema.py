from pydantic import BaseModel
from typing import List

class UserProfile(BaseModel):
    user_id: str
    aspiration: str

class SetGoalResponse(BaseModel):
    status : str