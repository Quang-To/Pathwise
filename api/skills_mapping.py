from fastapi import APIRouter, Depends, HTTPException
from access_control.auth import require_employee, User
from schemas.skills_mapping_schema import UserProfile, SkillMappingResponse
from apps.skills_mapping.skills_mapping import skills_mapping

router = APIRouter()

@router.get("/skills-mapping", response_model=SkillMappingResponse)
def get_skill_mapping(
    current_user: User = Depends(require_employee)
):
    try:
        user_profile = UserProfile(user_id=current_user.user_id)
        return skills_mapping(user_profile)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
