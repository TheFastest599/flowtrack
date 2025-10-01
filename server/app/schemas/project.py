from pydantic import BaseModel
from uuid import UUID
from datetime import date
from typing import Optional, List
from app.models.enums import ProjectStatus


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    deadline: Optional[date] = None


class ProjectRead(BaseModel):  # Add this
    id: str
    name: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: ProjectStatus
    created_by: str  # User ID
    created_at: str  # ISO datetime
    updated_at: str  # ISO datetime

    class Config:
        from_attributes = True

class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[ProjectStatus] = None


class ProjectResponse(ProjectBase):
    id: UUID
    status: ProjectStatus
    created_by: UUID
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True
        orm_mode = True


class ProjectWithTasks(ProjectResponse):
    tasks: List[dict] = []