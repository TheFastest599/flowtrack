from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from uuid import UUID
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.schemas.report import ProjectProgressReport, TeamPerformanceReport, WorkloadReport
from app.services.project_service import ProjectService
from app.dependencies import get_current_user, get_admin_user

router = APIRouter()


@router.get("/project/{project_id}", response_model=ProjectProgressReport)
async def get_project_progress(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project progress report."""
    # Check if project exists
    project = await ProjectService.get_project(db, project_id, current_user)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get progress data
    progress = await ProjectService.get_project_progress(db, project_id, current_user)
    
    return {
        "project_id": project_id,
        "project_name": project.name,
        **progress
    }


@router.get("/team-performance", response_model=List[TeamPerformanceReport])
async def get_team_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get team performance report (Admin only)."""
    # Get all users with their task counts
    result = await db.execute(
        select(
            User.id,
            User.name,
            User.email,
            func.count(Task.id).label("total_tasks"),
            func.sum(case((Task.status == "done", 1), else_=0)).label("completed_tasks"),
            func.sum(case((Task.status == "in_progress", 1), else_=0)).label("in_progress_tasks"),
            func.sum(case((Task.status == "todo", 1), else_=0)).label("todo_tasks")
        )
        .outerjoin(Task, User.id == Task.assigned_to)
        .group_by(User.id)
    )
    
    users_data = result.all()
    
    reports = []
    for user_data in users_data:
        total = user_data.total_tasks or 0
        completed = user_data.completed_tasks or 0
        completion_rate = (completed / total * 100) if total > 0 else 0
        
        reports.append({
            "user_id": str(user_data.id),
            "user_name": user_data.name,
            "total_tasks": total,
            "completed_tasks": completed,
            "in_progress_tasks": user_data.in_progress_tasks or 0,
            "todo_tasks": user_data.todo_tasks or 0,
            "completion_rate": round(completion_rate, 2)
        })
    
    return reports


@router.get("/workload", response_model=List[WorkloadReport])
async def get_workload_distribution(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get workload distribution report (Admin only)."""
    # Get task distribution by user
    result = await db.execute(
        select(
            User.id,
            User.name,
            func.count(Task.id).label("assigned_tasks"),
            func.sum(case((Task.priority == "high", 1), else_=0)).label("high_priority"),
            func.sum(case((Task.priority == "medium", 1), else_=0)).label("medium_priority"),
            func.sum(case((Task.priority == "low", 1), else_=0)).label("low_priority")
        )
        .outerjoin(Task, User.id == Task.assigned_to)
        .group_by(User.id)
    )
    
    users_data = result.all()
    
    reports = []
    for user_data in users_data:
        reports.append({
            "user_id": str(user_data.id),
            "user_name": user_data.name,
            "assigned_tasks": user_data.assigned_tasks or 0,
            "high_priority_tasks": user_data.high_priority or 0,
            "medium_priority_tasks": user_data.medium_priority or 0,
            "low_priority_tasks": user_data.low_priority or 0
        })
    
    return reports