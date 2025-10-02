from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from typing import Optional

from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from datetime import timedelta
from app.core.config import settings


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    async def register_user(db: AsyncSession, user_data: UserCreate) -> dict:
        """Register a new user and return tokens."""
        # Check if user exists
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role if hasattr(user_data, 'role') else "member"
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        # Generate tokens
        access_token = create_access_token(
            data={"id" :  str(user.id) ,"email": user.email, "role": user.role}
        )
        refresh_token = create_refresh_token(
            data={"id" :  str(user.id) ,"email": user.email, "role": user.role}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                # "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> dict:
        """Authenticate user and return tokens."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generate tokens
        access_token = create_access_token(
            data={"id" :  str(user.id) ,"email": user.email, "role": user.role}
        )
        refresh_token = create_refresh_token(
            data={"id" :  str(user.id) ,"email": user.email, "role": user.role}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                # "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }

    @staticmethod
    async def refresh_access_token(db: AsyncSession, refresh_token: str) -> dict:
        """Refresh access token using refresh token."""
        from app.core.security import decode_token
        from jose import JWTError
        
        try:
            payload = decode_token(refresh_token)
            email: str = payload.get("email")
            if email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token"
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Get user from database
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Generate new access token
        access_token = create_access_token(
            data={"id" :  str(user.id) ,"email": user.email, "role": user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }