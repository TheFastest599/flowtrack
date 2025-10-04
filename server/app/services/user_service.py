from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from uuid import UUID

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


class UserService:
    """Service for user-related operations."""

    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        """Create a new user."""
        hashed_password = get_password_hash(user_data.password)
        
        user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role
        )
        
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
            return user
        except IntegrityError:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100, search: Optional[str] = None, role: Optional[str] = None) -> List[User]:
        """Get all users with pagination and optional search and role filter."""
        query = select(User)
        if search:
            query = query.where(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
        if role:
            query = query.where(User.role == role)
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_user(db: AsyncSession, user_id: UUID, user_data: UserUpdate) -> Optional[User]:
        """Update user information."""
        user = await UserService.get_user_by_id(db, user_id)
        
        if not user:
            return None
        
        if user_data.name is not None:
            user.name = user_data.name
        if user_data.email is not None:
            user.email = user_data.email
        if user_data.role is not None:
            user.role = user_data.role
        if user_data.password is not None:
            user.password_hash = get_password_hash(user_data.password)
        
        try:
            await db.commit()
            await db.refresh(user)
            return user
        except IntegrityError:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: UUID) -> bool:
        """Delete a user."""
        user = await UserService.get_user_by_id(db, user_id)
        
        if not user:
            return False
        
        await db.delete(user)
        await db.commit()
        return True
