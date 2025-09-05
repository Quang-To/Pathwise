from pydantic import BaseModel

class UserProfile(BaseModel):
    user_id: str

class ExternalCourseResponse(BaseModel):
    status: str