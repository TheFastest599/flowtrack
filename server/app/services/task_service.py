from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Optional
from datetime import datetime

from app.models.task import Task
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.task import TaskCreate, TaskUpdate
from app.core.redis import redis_client


class TaskService:
    """Service for task-related operations."""

    @staticmethod
    async def create_task(db: AsyncSession, task_data: TaskCreate, user_id: UUID) -> Task:
        """Create a new task."""
        task = Task(
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            status=task_data.status if hasattr(task_data, 'status') else "todo",
            deadline=task_data.deadline,
            project_id=task_data.project_id,
            assigned_to=task_data.assigned_to
        )
        
        db.add(task)
        await db.commit()
        await db.refresh(task)
        
        # Log activity
        await TaskService._log_activity(db, user_id, f"created task: {task.title}")
        
        # Publish event to Redis
        await redis_client.publish("task_updates", {
            "event": "task_created",
            "task_id": str(task.id),
            "task_title": task.title,
            "project_id": str(task.project_id),
            "assigned_to": str(task.assigned_to) if task.assigned_to else None,
            "created_by": str(user_id)
        })
        
        return task

    @staticmethod
    async def get_task(db: AsyncSession, task_id: UUID) -> Optional[Task]:
        """Get task by ID."""
        result = await db.execute(select(Task).where(Task.id == task_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_tasks(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        project_id: Optional[UUID] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        assigned_to: Optional[UUID] = None
    ) -> List[Task]:
        """Get all tasks with optional filtering."""
        query = select(Task)
        
        if project_id:
            query = query.where(Task.project_id == project_id)
        if status:
            query = query.where(Task.status == status)
        if priority:
            query = query.where(Task.priority == priority)
        if assigned_to:
            query = query.where(Task.assigned_to == assigned_to)
        
        query = query.offset(skip).limit(limit).order_by(Task.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_task(
        db: AsyncSession,
        task_id: UUID,
        task_data: TaskUpdate,
        user_id: UUID
    ) -> Optional[Task]:
        """Update task information."""
        task = await TaskService.get_task(db, task_id)
        
        if not task:
            return None
        
        # Track status change for notification
        old_status = task.status
        
        # Update fields
        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        if task_data.priority is not None:
            task.priority = task_data.priority
        if task_data.status is not None:
            task.status = task_data.status
        if task_data.deadline is not None:
            task.deadline = task_data.deadline
        if hasattr(task_data, 'assigned_to') and task_data.assigned_to is not None:
            task.assigned_to = task_data.assigned_to
        
        task.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(task)
        
        # Log activity
        await TaskService._log_activity(db, user_id, f"updated task: {task.title}")
        
        # Publish event to Redis
        event_data = {
            "event": "task_updated",
            "task_id": str(task.id),
            "task_title": task.title,
            "project_id": str(task.project_id),
            "updated_by": str(user_id)
        }
        
        if old_status != task.status:
            event_data["status_changed"] = {
                "old": old_status,
                "new": task.status
            }
        
        await redis_client.publish("task_updates", event_data)
        
        return task

    @staticmethod
    async def delete_task(db: AsyncSession, task_id: UUID, user_id: UUID) -> bool:
        """Delete a task."""
        task = await TaskService.get_task(db, task_id)
        
        if not task:
            return False
        
        task_title = task.title
        project_id = task.project_id
        
        await db.delete(task)
        await db.commit()
        
        # Log activity
        await TaskService._log_activity(db, user_id, f"deleted task: {task_title}")
        
        # Publish event to Redis
        await redis_client.publish("task_updates", {
            "event": "task_deleted",
            "task_id": str(task_id),
            "task_title": task_title,
            "project_id": str(project_id),
            "deleted_by": str(user_id)
        })
        
        return True

    @staticmethod
    async def move_task(
        db: AsyncSession,
        task_id: UUID,
        new_status: str,
        user_id: UUID
    ) -> Optional[Task]:
        """Move task to a new status (for Kanban drag-and-drop)."""
        task = await TaskService.get_task(db, task_id)
        
        if not task:
            return None
        
        old_status = task.status
        task.status = new_status
        task.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(task)
        
        # Log activity
        await TaskService._log_activity(
            db, user_id,
            f"moved task '{task.title}' from {old_status} to {new_status}"
        )
        
        # Publish event to Redis for real-time Kanban update
        await redis_client.publish("kanban_updates", {
            "event": "task_moved",
            "task_id": str(task.id),
            "task_title": task.title,
            "old_status": old_status,
            "new_status": new_status,
            "project_id": str(task.project_id),
            "moved_by": str(user_id)
        })
        
        return task

    @staticmethod
    async def _log_activity(db: AsyncSession, user_id: UUID, action: str):
        """Internal method to log user activity."""
        activity = ActivityLog(
            user_id=user_id,
            action=action
        )
        db.add(activity)
        await db.commit()