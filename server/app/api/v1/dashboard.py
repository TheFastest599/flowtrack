from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.services.dashboard_service import DashboardService
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard data for the current user."""
    return await DashboardService.get_dashboard_data(db, current_user)
