from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional

from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

class TaskService:
    @staticmethod
    async def get_tasks(
        db: AsyncSession,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        project_id: Optional[UUID] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        assigned_to: Optional[UUID] = None
    ) -> List[TaskResponse]:
        query = select(Task)
        if project_id:
            query = query.where(Task.project_id == project_id)
        if status:
            query = query.where(Task.status == status)
        if priority:
            query = query.where(Task.priority == priority)
        if assigned_to:
            query = query.where(Task.assigned_to == assigned_to)
        
        # Filter for non-admin users: only tasks assigned to them
        if current_user.role != "admin":
            query = query.where(Task.assigned_to == current_user.id)
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        tasks = result.scalars().all()
        return [TaskResponse.from_orm(t) for t in tasks]

    @staticmethod
    async def get_task(db: AsyncSession, task_id: UUID, current_user: User) -> Optional[TaskResponse]:
        query = select(Task).where(Task.id == task_id)
        
        # Filter for non-admin users
        if current_user.role != "admin":
            query = query.where(Task.assigned_to == current_user.id)
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        return TaskResponse.from_orm(task) if task else None

    @staticmethod
    async def create_task(db: AsyncSession, task_data: TaskCreate, current_user: User) -> TaskResponse:
        # Check if user can create (e.g., is member of project or admin)
        # Assuming project membership check is done here or in schema validation
        task = Task(
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            priority=task_data.priority,
            project_id=task_data.project_id,
            assigned_to=task_data.assigned_to or current_user.id,  # Default to self
            created_by=current_user.id
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return TaskResponse.from_orm(task)

    @staticmethod
    async def update_task(db: AsyncSession, task_id: UUID, task_data: TaskUpdate, current_user: User) -> Optional[TaskResponse]:
        query = select(Task).where(Task.id == task_id)
        if current_user.role != "admin":
            query = query.where(Task.assigned_to == current_user.id)
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        if not task:
            return None
        
        for key, value in task_data.dict(exclude_unset=True).items():
            setattr(task, key, value)
        
        await db.commit()
        await db.refresh(task)
        return TaskResponse.from_orm(task)

    @staticmethod
    async def delete_task(db: AsyncSession, task_id: UUID, current_user: User) -> bool:
        query = select(Task).where(Task.id == task_id)
        if current_user.role != "admin":
            query = query.where(Task.assigned_to == current_user.id)
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        if not task:
            return False
        
        await db.delete(task)
        await db.commit()
        return True

    @staticmethod
    async def move_task(db: AsyncSession, task_id: UUID, new_status: str, current_user: User) -> Optional[TaskResponse]:
        query = select(Task).where(Task.id == task_id)
        if current_user.role != "admin":
            query = query.where(Task.assigned_to == current_user.id)
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        if not task:
            return None
        
        task.status = new_status
        await db.commit()
        await db.refresh(task)
        return TaskResponse.from_orm(task)