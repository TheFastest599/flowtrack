from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.database import get_db
from app.services.task_service import TaskService
from app.core.security import get_current_user
from app.models.user import User

app = FastAPI()

@pytest.mark.asyncio
async def test_create_task(db: AsyncSession, user: User):
    task_data = TaskCreate(title="Test Task", description="Test Description", project_id="some-project-id")
    response = await TaskService.create_task(db, task_data, user.id)
    assert response.title == task_data.title
    assert response.description == task_data.description

@pytest.mark.asyncio
async def test_get_task(db: AsyncSession, user: User):
    task = await TaskService.create_task(db, TaskCreate(title="Test Task", description="Test Description", project_id="some-project-id"), user.id)
    response = await TaskService.get_task(db, task.id)
    assert response.id == task.id

@pytest.mark.asyncio
async def test_update_task(db: AsyncSession, user: User):
    task = await TaskService.create_task(db, TaskCreate(title="Test Task", description="Test Description", project_id="some-project-id"), user.id)
    update_data = TaskUpdate(title="Updated Task")
    response = await TaskService.update_task(db, task.id, update_data)
    assert response.title == update_data.title

@pytest.mark.asyncio
async def test_delete_task(db: AsyncSession, user: User):
    task = await TaskService.create_task(db, TaskCreate(title="Test Task", description="Test Description", project_id="some-project-id"), user.id)
    await TaskService.delete_task(db, task.id)
    with pytest.raises(HTTPException):
        await TaskService.get_task(db, task.id)