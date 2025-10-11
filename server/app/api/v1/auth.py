from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.database import get_db
from app.schemas.auth import UserCreate, UserLogin, Token
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate,response : Response, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    result = await AuthService.register_user(db, user_data)
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],  # Wait, no—store the token before popping
        httponly=True,
        secure=settings.MODE == "production",
        samesite="none",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    result.pop("refresh_token")
    return result


@router.post("/login")
async def login(credentials: UserLogin, response : Response, db: AsyncSession = Depends(get_db)):
    """Login user and return JWT tokens."""
    result =  await AuthService.authenticate_user(db, credentials.email, credentials.password)
    response.set_cookie(
        key="refresh_token",
        value=result["refresh_token"],  # Wait, no—store the token before popping
        httponly=True,
        secure=settings.MODE == "production",
        samesite="none",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    result.pop("refresh_token")
    return result


@router.post("/refresh")
async def refresh_token( request : Request,response : Response, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
    return await AuthService.refresh_access_token(db, refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout():
    """Logout user by clearing the refresh token cookie."""
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(
    key="refresh_token",
    httponly=True,
    secure=settings.MODE == "production",
    samesite="none"
    )
    return response