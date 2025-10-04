from fastapi import APIRouter

router = APIRouter()

from . import auth, users, projects, tasks, reports, dashboard

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(projects.router, prefix="/projects", tags=["projects"])
router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
router.include_router(reports.router, prefix="/reports", tags=["reports"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
