from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional

from app.models.user import User
from app.models.project import Project
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
        if current_user.role != "admin":
            query = query.where(Project.members.any(User.id == current_user.id))  # Assuming many-to-many relationship
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        projects = result.scalars().all()
        return [ProjectResponse.from_orm(p) for p in projects]

    @staticmethod
    async def get_project(db: AsyncSession, project_id: UUID, current_user: User) -> Optional[ProjectResponse]:
        query = select(Project).where(Project.id == project_id)
        
        # Filter for non-admin users
        if current_user.role != "admin":
            query = query.where(Project.members.any(User.id == current_user.id))
        
        result = await db.execute(query)
        project = result.scalar_one_or_none()
        return ProjectResponse.from_orm(project) if project else None

    @staticmethod
    async def get_project_progress(db: AsyncSession, project_id: UUID, current_user: User) -> Optional[dict]:
        # First check access
        project = await ProjectService.get_project(db, project_id, current_user)
        if not project:
            return None
        
        # Calculate progress (e.g., tasks completed / total tasks)
        # Implement your logic here
        return {"progress": 75}  # Example

    # Other methods (create, update, delete) remain admin-only as before