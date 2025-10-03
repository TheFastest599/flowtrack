from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
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
        status: Optional[str] = None,
        query: Optional[str] = None
    ) -> List[ProjectResponse]:
        query_stmt = select(Project).options(joinedload(Project.creator))
        if status:
            query_stmt = query_stmt.where(Project.status == status)
        if query:
            query_stmt = query_stmt.where(Project.name.ilike(f"%{query}%"))
        
        # Filter for non-admin users: only projects where user is a member
        if current_user['role'] != "admin":
            query_stmt = query_stmt.where(Project.members.any(User.id == current_user['id']))  # Assuming many-to-many relationship
        
        query_stmt = query_stmt.offset(skip).limit(limit)
        result = await db.execute(query_stmt)
        projects = result.unique().scalars().all()
        return [
            ProjectResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                deadline=p.deadline,
                status=p.status,
                created_by=p.created_by,
                creator_name=p.creator.name,
                created_at=p.created_at,
                updated_at=p.updated_at
            ) for p in projects
        ]

    @staticmethod
    async def get_project(db: AsyncSession, project_id: UUID, current_user: dict) -> Optional[ProjectResponse]:
        query = select(Project).options(joinedload(Project.creator)).where(Project.id == project_id)
        
        # Filter for non-admin users
        if current_user['role'] != "admin":
            query = query.where(Project.members.any(User.id == current_user['id']))
        
        result = await db.execute(query)
        project = result.unique().scalar_one_or_none()
        if not project:
            return None
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            deadline=project.deadline,
            status=project.status,
            created_by=project.created_by,
            creator_name=project.creator.name,
            created_at=project.created_at,
            updated_at=project.updated_at
        )

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
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            deadline=project.deadline,
            status=project.status,
            created_by=project.created_by,
            creator_name=current_user['name'],
            created_at=project.created_at,
            updated_at=project.updated_at
        )

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
        
        query = select(Project).options(joinedload(Project.creator)).where(Project.id == project_id)
        result = await db.execute(query)
        project = result.scalar_one_or_none()
        if not project:
            return None
        
        for key, value in project_data.dict(exclude_unset=True).items():
            setattr(project, key, value)
        project.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        await db.refresh(project)
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            deadline=project.deadline,
            status=project.status,
            created_by=project.created_by,
            creator_name=project.creator.name,
            created_at=project.created_at,
            updated_at=project.updated_at
        )

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

    @staticmethod
    async def add_member_to_project(db: AsyncSession, project_id: UUID, user_id: UUID, current_user: dict) -> bool:
        if current_user['role'] != "admin":
            raise HTTPException(status_code=403, detail="Only admins can assign members to projects")
        
        result = await db.execute(select(Project).options(joinedload(Project.members)).where(Project.id == project_id))
        project = result.unique().scalar_one_or_none()
        if not project:
            return False
        
        user = await db.get(User, user_id)
        if not user:
            return False
        
        if user not in project.members:
            project.members.append(user)
            await db.commit()
        
        return True

    @staticmethod
    async def remove_member_from_project(db: AsyncSession, project_id: UUID, user_id: UUID, current_user: dict) -> bool:
        if current_user['role'] != "admin":
            raise HTTPException(status_code=403, detail="Only admins can remove members from projects")
        
        result = await db.execute(select(Project).options(joinedload(Project.members)).where(Project.id == project_id))
        project = result.unique().scalar_one_or_none()
        if not project:
            return False
        
        user = await db.get(User, user_id)
        if not user:
            return False
        
        if user in project.members:
            project.members.remove(user)
            await db.commit()
        
        return True

    @staticmethod
    async def get_project_members(db: AsyncSession, project_id: UUID, current_user: dict, search: Optional[str] = None) -> List[dict]:
        # Allow if admin or member of the project
        if current_user['role'] != "admin":
            member_query = select(Project).where(Project.id == project_id).where(Project.members.any(User.id == current_user['id']))
            result = await db.execute(member_query)
            if not result.scalar_one_or_none():
                raise HTTPException(status_code=403, detail="Access denied")
        
        result = await db.execute(select(Project).options(joinedload(Project.members)).where(Project.id == project_id))
        project = result.unique().scalar_one_or_none()
        if not project:
            return []
        
        # Filter members by search term if provided
        members = project.members
        if search:
            search_lower = search.lower()
            members = [u for u in members if search_lower in u.name.lower() or search_lower in u.email.lower()]
        
        # Return list of user dicts
        return [{"id": str(u.id), "name": u.name, "email": u.email} for u in members]