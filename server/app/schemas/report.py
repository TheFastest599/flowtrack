from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class TaskReport(BaseModel):
    task_id: UUID
    title: str
    status: str
    priority: str
    assigned_to: Optional[UUID]
    created_at: datetime
    updated_at: datetime

class ProjectReport(BaseModel):
    project_id: UUID
    name: str
    description: str
    status: str
    tasks: List[TaskReport]

class ProjectProgressReport(BaseModel):
    project_id: UUID
    project_name: str
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    todo_tasks: int
    progress_percentage: float

class TeamPerformanceReport(BaseModel):
    user_id: str
    user_name: str
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    todo_tasks: int
    completion_rate: float

class WorkloadReport(BaseModel):
    user_id: str
    user_name: str
    assigned_tasks: int
    high_priority_tasks: int
    medium_priority_tasks: int
    low_priority_tasks: int