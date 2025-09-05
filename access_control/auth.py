import os
from jose import jwt
import bcrypt
from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from database.session import get_data
from database.db import Users, Roles, UserRoles

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

EMPLOYEE = "employee"
MANAGER = "manager"
HR = "hr"
ADMIN = "admin"
LD = "ld"

class User(BaseModel):
    user_id: str
    role: str

def authenticate_user(username: str, password: str) -> Optional[User]:
    """
    Authenticate user by username and password
    """
    users_data = get_data(Users.USER_DATABASE.value, Users.USER_TABLE.value)
    if not users_data:
        print("⚠️ Users table empty")
        return None

    user_row = next((u for u in users_data if u.get(Users.USERNAME.value) == username), None)
    if not user_row:
        print(f"⚠️ Username '{username}' not found")
        return None

    if not bcrypt.checkpw(password.encode("utf-8"), user_row[Users.PASSWORD_HASH.value].encode("utf-8")):
        print(f"⚠️ Incorrect password for username '{username}'")
        return None

    # Lấy role
    user_roles_data = get_data(UserRoles.USER_ROLE_DATABASE.value, UserRoles.USER_ROLE_TABLE.value)
    roles_data = get_data(Roles.ROLE_DATABASE.value, Roles.ROLE_TABLE.value)
    if not user_roles_data or not roles_data:
        print(f"⚠️ Role tables empty")
        return None

    role_id = next(
        (ur[UserRoles.ROLE_ID.value] for ur in user_roles_data if ur[UserRoles.USER_ID.value] == user_row[Users.USER_ID.value]),
        None
    )
    if not role_id:
        print(f"⚠️ No role assigned for user '{username}'")
        return None

    role_name = next((r[Roles.ROLE_NAME.value] for r in roles_data if r[Roles.ROLE_ID.value] == role_id), None)
    if not role_name:
        print(f"⚠️ Role ID '{role_id}' not found in roles table")
        return None

    return User(user_id=str(user_row[Users.USER_ID.value]), role=role_name)


def get_current_user_token(token: str = Depends(oauth2_scheme)) -> User:
    """
    Decode the token and retrieve user information from PostgreSQL DB.
    Print detailed reasons for failure.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = str(payload.get("sub"))
        if not user_id:
            print("⚠️ Token payload missing 'sub'")
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except jwt.ExpiredSignatureError:
        print("⚠️ Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError as e:
        print(f"⚠️ JWT decode error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    user_roles_data = get_data(UserRoles.USER_ROLE_DATABASE.value, UserRoles.USER_ROLE_TABLE.value)
    roles_data = get_data(Roles.ROLE_DATABASE.value, Roles.ROLE_TABLE.value)
    if not user_roles_data or not roles_data:
        print(f"⚠️ Role tables empty or user roles missing for user_id {user_id}")
        raise HTTPException(status_code=401, detail="User not found or no role assigned")

    role_id = next(
        (ur[UserRoles.ROLE_ID.value] for ur in user_roles_data if str(ur[UserRoles.USER_ID.value]) == user_id),
        None
    )
    if not role_id:
        print(f"⚠️ No role assigned for user_id '{user_id}'")
        raise HTTPException(status_code=401, detail="User not found or no role assigned")

    role_name = next((r[Roles.ROLE_NAME.value] for r in roles_data if r[Roles.ROLE_ID.value] == role_id), None)
    if not role_name:
        print(f"⚠️ Role ID '{role_id}' not found in roles table")
        raise HTTPException(status_code=401, detail="User role not found")

    return User(user_id=user_id, role=role_name)


def require_admin(user: User = Depends(get_current_user_token)):
    if user.role != ADMIN:
        print(f"⚠️ Access denied: user '{user.user_id}' is not admin")
        raise HTTPException(status_code=403, detail="Admin access only")
    return user

def require_hr(user: User = Depends(get_current_user_token)):
    if user.role not in [HR, ADMIN]:
        print(f"⚠️ Access denied: user '{user.user_id}' is not HR/Admin")
        raise HTTPException(status_code=403, detail="HR access only")
    return user

def require_manager(user: User = Depends(get_current_user_token)):
    if user.role not in [MANAGER]:
        print(f"⚠️ Access denied: user '{user.user_id}' is not Manager/Admin")
        raise HTTPException(status_code=403, detail="Manager access only")
    return user

def require_employee(user: User = Depends(get_current_user_token)):
    if user.role not in [EMPLOYEE, MANAGER]:
        print(f"⚠️ Access denied: user '{user.user_id}' is not Employee/Manager/Admin")
        raise HTTPException(status_code=403, detail="Employee access only")
    return user