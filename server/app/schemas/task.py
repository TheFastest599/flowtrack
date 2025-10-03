from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from app.models.enums import TaskStatus, TaskPriority


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.medium
    status: TaskStatus = TaskStatus.todo
    deadline: Optional[date] = None

class TaskRead(TaskBase):  # Add this
    id: UUID
    project_id: UUID
    assigned_to: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True


class TaskCreate(TaskBase):
    project_id: UUID
    assigned_to: Optional[UUID] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    deadline: Optional[date] = None
    assigned_to: Optional[UUID] = None


class TaskResponse(TaskBase):
    id: UUID
    project_id: UUID
    assigned_to: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True


class TaskMoveRequest(BaseModel):
    new_status: TaskStatus