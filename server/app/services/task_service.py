from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
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
        query = select(Task).options(selectinload(Task.assignee))
        if project_id:
            query = query.where(Task.project_id == project_id)
        if status:
            query = query.where(Task.status == status)
        if priority:
            query = query.where(Task.priority == priority)
        if assigned_to:
            query = query.where(Task.assigned_to == assigned_to)
        
        # Filter for non-admin users: only tasks assigned to them
        if current_user['role'] != "admin":
            query = query.where(Task.assigned_to == current_user['id'])
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        tasks = result.scalars().all()
        responses = []
        for t in tasks:
            response = TaskResponse.from_orm(t)
            response.assigned_to_name = t.assignee.name if t.assignee else None
            responses.append(response)
        return responses

    @staticmethod
    async def get_task(db: AsyncSession, task_id: UUID, current_user: User) -> Optional[TaskResponse]:
        query = select(Task).options(selectinload(Task.assignee)).where(Task.id == task_id)
        
        # Filter for non-admin users
        if current_user['role'] != "admin":
            query = query.where(Task.assigned_to == current_user['id'])
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        if task:
            response = TaskResponse.from_orm(task)
            response.assigned_to_name = task.assignee.name if task.assignee else None
            return response
        return None

    @staticmethod
    async def create_task(db: AsyncSession, task_data: TaskCreate, current_user: dict) -> TaskResponse:
        from app.models.project import Project
        from fastapi import HTTPException
        
        if current_user['role'] != "admin":
            # Check if user is member of the project
            project_query = select(Project).where(Project.id == task_data.project_id).where(Project.members.any(User.id == current_user['id']))
            project_result = await db.execute(project_query)
            if not project_result.scalar_one_or_none():
                raise HTTPException(status_code=403, detail="You are not a member of this project")
        
        # Check if assigned user is a member of the project
        if task_data.assigned_to:
            assigned_check = select(Project).where(Project.id == task_data.project_id).where(Project.members.any(User.id == task_data.assigned_to))
            assigned_result = await db.execute(assigned_check)
            if not assigned_result.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Assigned user is not a member of the project")
        
        task = Task(
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            priority=task_data.priority,
            deadline=task_data.deadline,
            project_id=task_data.project_id,
            assigned_to=task_data.assigned_to,
            created_by=current_user['id']
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return TaskResponse.from_orm(task)

    @staticmethod
    async def update_task(db: AsyncSession, task_id: UUID, task_data: TaskUpdate, current_user: User) -> Optional[TaskResponse]:
        from app.models.project import Project
        from fastapi import HTTPException
        
        query = select(Task).where(Task.id == task_id)
        if current_user['role'] != "admin":
            query = query.where(Task.assigned_to == current_user['id'])
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        if not task:
            return None
        
        # Check if trying to reassign
        if task_data.assigned_to is not None and task_data.assigned_to != task.assigned_to:
            if current_user['role'] != "admin":
                raise HTTPException(status_code=403, detail="Only admins can reassign tasks")
            # Check if new assignee is member
            if task_data.assigned_to:
                assigned_check = select(Project).where(Project.id == task.project_id).where(Project.members.any(User.id == task_data.assigned_to))
                assigned_result = await db.execute(assigned_check)
                if not assigned_result.scalar_one_or_none():
                    raise HTTPException(status_code=400, detail="Assigned user is not a member of the project")
        
        for key, value in task_data.dict(exclude_unset=True).items():
            setattr(task, key, value)
        
        await db.commit()
        await db.refresh(task)
        return TaskResponse.from_orm(task)

    @staticmethod
    async def delete_task(db: AsyncSession, task_id: UUID, current_user: User) -> bool:
        query = select(Task).where(Task.id == task_id)
        if current_user['role'] != "admin":
            query = query.where(Task.assigned_to == current_user['id'])
        
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
        if current_user['role'] != "admin":
            query = query.where(Task.assigned_to == current_user['id'])
        
        result = await db.execute(query)
        task = result.scalar_one_or_none()
        if not task:
            return None
        
        task.status = new_status
        await db.commit()
        await db.refresh(task)
        return TaskResponse.from_orm(task)