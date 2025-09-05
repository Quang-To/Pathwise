from pydantic import BaseModel

class InputFeedBack(BaseModel):
    user_id: str
    course_id: str
    feedback: str

class FeedBackResponse(BaseModel):
    status: str