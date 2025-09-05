from pydantic import BaseModel
from typing import List, Dict

class UserProfile(BaseModel):
    user_id: str

class SkillMappingResponse(BaseModel):
    mappings: Dict[str, List[str]]
