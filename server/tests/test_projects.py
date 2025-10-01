from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.project_service import ProjectService
from app.core.security import get_current_active_user
from app.models.user import User
import pytest

@pytest.mark.asyncio
async def test_create_project(db: AsyncSession, user: User):
    project_data = ProjectCreate(name="Test Project", description="A project for testing")
    project_service = ProjectService(db)
    project = await project_service.create_project(project_data, user.id)
    
    assert project.name == project_data.name
    assert project.description == project_data.description

@pytest.mark.asyncio
async def test_get_project(db: AsyncSession, user: User):
    project_service = ProjectService(db)
    project = await project_service.get_project_by_id("some-project-id")
    
    assert project is not None
    assert project.id == "some-project-id"

@pytest.mark.asyncio
async def test_update_project(db: AsyncSession, user: User):
    project_service = ProjectService(db)
    update_data = ProjectUpdate(name="Updated Project Name")
    updated_project = await project_service.update_project("some-project-id", update_data, user.id)
    
    assert updated_project.name == update_data.name

@pytest.mark.asyncio
async def test_delete_project(db: AsyncSession, user: User):
    project_service = ProjectService(db)
    await project_service.delete_project("some-project-id", user.id)
    
    with pytest.raises(HTTPException):
        await project_service.get_project_by_id("some-project-id")