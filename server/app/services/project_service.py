from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional
from datetime import datetime

from app.models.project import Project
from app.models.task import Task
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.core.redis import redis_client
import json


class ProjectService:
    """Service for project-related operations."""

    @staticmethod
    async def create_project(db: AsyncSession, project_data: ProjectCreate, user_id: UUID) -> Project:
        """Create a new project."""
        project = Project(
            name=project_data.name,
            description=project_data.description,
            deadline=project_data.deadline,
            created_by=user_id
        )
        
        db.add(project)
        await db.commit()
        await db.refresh(project)
        
        # Publish event to Redis
        await redis_client.publish("project_updates", {
            "event": "project_created",
            "project_id": str(project.id),
            "project_name": project.name,
            "created_by": str(user_id)
        })
        
        return project

    @staticmethod
    async def get_project(db: AsyncSession, project_id: UUID) -> Optional[Project]:
        """Get project by ID with tasks."""
        result = await db.execute(
            select(Project).where(Project.id == project_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_projects(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[Project]:
        """Get all projects with optional filtering."""
        query = select(Project)
        
        if status:
            query = query.where(Project.status == status)
        
        query = query.offset(skip).limit(limit).order_by(Project.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_project(
        db: AsyncSession,
        project_id: UUID,
        project_data: ProjectUpdate,
        user_id: UUID
    ) -> Optional[Project]:
        """Update project information."""
        project = await ProjectService.get_project(db, project_id)
        
        if not project:
            return None
        
        # Update fields
        if project_data.name is not None:
            project.name = project_data.name
        if project_data.description is not None:
            project.description = project_data.description
        if project_data.deadline is not None:
            project.deadline = project_data.deadline
        if project_data.status is not None:
            project.status = project_data.status
        
        project.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(project)
        
        # Publish event to Redis
        await redis_client.publish("project_updates", {
            "event": "project_updated",
            "project_id": str(project.id),
            "updated_by": str(user_id)
        })
        
        return project

    @staticmethod
    async def delete_project(db: AsyncSession, project_id: UUID, user_id: UUID) -> bool:
        """Delete a project."""
        project = await ProjectService.get_project(db, project_id)
        
        if not project:
            return False
        
        await db.delete(project)
        await db.commit()
        
        # Publish event to Redis
        await redis_client.publish("project_updates", {
            "event": "project_deleted",
            "project_id": str(project_id),
            "deleted_by": str(user_id)
        })
        
        return True

    @staticmethod
    async def get_project_progress(db: AsyncSession, project_id: UUID) -> dict:
        """Get project progress statistics."""
        result = await db.execute(
            select(Task).where(Task.project_id == project_id)
        )
        tasks = list(result.scalars().all())
        
        total_tasks = len(tasks)
        if total_tasks == 0:
            return {
                "project_id": str(project_id),
                "total_tasks": 0,
                "completed_tasks": 0,
                "progress_percentage": 0
            }
        
        completed_tasks = sum(1 for task in tasks if task.status == "done")
        progress = (completed_tasks / total_tasks) * 100
        
        return {
            "project_id": str(project_id),
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": sum(1 for task in tasks if task.status == "in_progress"),
            "todo_tasks": sum(1 for task in tasks if task.status == "todo"),
            "progress_percentage": round(progress, 2)
        }