from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException

from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

class ProjectService:
    @staticmethod
    async def get_projects(
        db: AsyncSession,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[ProjectResponse]:
        query = select(Project)
        if status:
            query = query.where(Project.status == status)
        
        # Filter for non-admin users: only projects where user is a member
        if current_user['role'] != "admin":
            query = query.where(Project.members.any(User.id == current_user.id))  # Assuming many-to-many relationship
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        projects = result.scalars().all()
        return [ProjectResponse.from_orm(p) for p in projects]

    @staticmethod
    async def get_project(db: AsyncSession, project_id: UUID, current_user: User) -> Optional[ProjectResponse]:
        query = select(Project).where(Project.id == project_id)
        
        # Filter for non-admin users
        if current_user['role'] != "admin":
            query = query.where(Project.members.any(User.id == current_user.id))
        
        result = await db.execute(query)
        project = result.scalar_one_or_none()
        return ProjectResponse.from_orm(project) if project else None

    @staticmethod
    async def get_project_progress(db: AsyncSession, project_id: UUID, current_user: dict) -> Optional[dict]:
        # First check access
        project = await ProjectService.get_project(db, project_id, current_user)
        if not project:
            return None
        
        # Calculate progress based on tasks
        total_tasks = await db.execute(
            select(func.count(Task.id)).where(Task.project_id == project_id)
        )
        total = total_tasks.scalar() or 0
        
        completed_tasks = await db.execute(
            select(func.count(Task.id)).where(Task.project_id == project_id).where(Task.status == "done")
        )
        completed = completed_tasks.scalar() or 0
        
        progress_percentage = (completed / total * 100) if total > 0 else 0
        
        return {
            "total_tasks": total,
            "completed_tasks": completed,
            "progress": round(progress_percentage, 2)
        }

    @staticmethod
    async def create_project(db: AsyncSession, project_data: ProjectCreate, current_user: dict) -> ProjectResponse:
        if current_user['role'] != "admin":
            raise HTTPException(status_code=403, detail="Only admins can create projects")
        
        project = Project(**project_data.dict(), created_by=current_user['id'])
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return ProjectResponse.from_orm(project)

    @staticmethod
    async def update_project(db: AsyncSession, project_id: UUID, project_data: ProjectUpdate, current_user: dict) -> Optional[ProjectResponse]:
        from app.models.project import Project
        
        # Allow if admin or member of the project
        if current_user['role'] != "admin":
            # Check if user is member
            member_query = select(Project).where(Project.id == project_id).where(Project.members.any(User.id == current_user['id']))
            member_result = await db.execute(member_query)
            if not member_result.scalar_one_or_none():
                raise HTTPException(status_code=403, detail="You are not authorized to update this project")
        
        query = select(Project).where(Project.id == project_id)
        result = await db.execute(query)
        project = result.scalar_one_or_none()
        if not project:
            return None
        
        for key, value in project_data.dict(exclude_unset=True).items():
            setattr(project, key, value)
        project.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        await db.refresh(project)
        return ProjectResponse.from_orm(project)

    @staticmethod
    async def delete_project(db: AsyncSession, project_id: UUID, current_user: dict) -> bool:
        if current_user['role'] != "admin":
            raise HTTPException(status_code=403, detail="Only admins can delete projects")
        
        query = select(Project).where(Project.id == project_id)
        result = await db.execute(query)
        project = result.scalar_one_or_none()
        if not project:
            return False
        
        await db.delete(project)
        await db.commit()
        return True