from core.config import Settings
from database.db import EmployeeTable
from database.session import get_data, update_data
from schemas.goal_schema import UserProfile, SetGoalResponse
from schemas.recommendation_schema import UserProfile as InputRecommend
from apps.recommendation.pipeline import main as run_recommendation

settings = Settings()

def set_goal(user_profile: UserProfile) -> SetGoalResponse:
    try:
        employee_rows = get_data(
            schema=EmployeeTable.EMPLOYEE_DATABASE.value,
            table_name=EmployeeTable.EMPLOYEE_TABLE.value
        )
        if not employee_rows:
            return SetGoalResponse(status="Employee table is empty")

        try:
            user_id_int = int(user_profile.user_id)
        except ValueError:
            return SetGoalResponse(status=f"Invalid user_id: {user_profile.user_id}")

        employee_row = next(
            (r for r in employee_rows if r.get(EmployeeTable.EMPLOYEE_ID.value) == user_id_int),
            None
        )
        if not employee_row:
            return SetGoalResponse(status=f"User {user_profile.user_id} not found")

        goal_name = str(user_profile.aspiration).strip()

        update_payload = [{
            EmployeeTable.EMPLOYEE_ID.value: user_id_int,
            EmployeeTable.ASPIRATION.value: goal_name
        }]

        update_data(
            data=update_payload,
            schema=EmployeeTable.EMPLOYEE_DATABASE.value,
            table_name=EmployeeTable.EMPLOYEE_TABLE.value,
            condition_cols=[EmployeeTable.EMPLOYEE_ID.value]
        )

        run_recommendation(InputRecommend(user_id=str(user_id_int), update=True))

        return SetGoalResponse(status="Goal updated and recommendation refreshed.")

    except Exception as e:
        print(f"[ERROR] Exception occurred: {e}")
        return SetGoalResponse(status=f"Update failed: {e}")
