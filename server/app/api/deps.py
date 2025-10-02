from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.security import get_current_user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user
    if current_user.is_active:
        return current_user
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

async def get_admin_user(current_user: User = Depends(get_current_active_user)):
    if current_user.role == "admin":
        return current_user
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")