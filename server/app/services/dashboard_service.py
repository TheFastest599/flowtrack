from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from app.models.user import User
from app.services.project_service import ProjectService
from app.services.task_service import TaskService

class DashboardService:
    @staticmethod
    async def get_dashboard_data(db: AsyncSession, current_user: User) -> Dict[str, Any]:
        # Get user's projects
        projects = await ProjectService.get_projects(db, current_user)
        
        # Get user's tasks
        tasks = await TaskService.get_tasks(db, current_user=current_user)
        
        # Calculate stats
        total_tasks = len(tasks)
        completed_tasks = sum(1 for task in tasks if task.status == "done")
        in_progress_tasks = sum(1 for task in tasks if task.status == "in_progress")
        todo_tasks = sum(1 for task in tasks if task.status == "todo")
        
        return {
            "projects": projects,
            "tasks": tasks,
            "stats": {
                "total_projects": len(projects),
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "in_progress_tasks": in_progress_tasks,
                "todo_tasks": todo_tasks,
            }
        }
