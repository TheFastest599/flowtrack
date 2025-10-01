from fastapi import FastAPI, HTTPException, Depends
from fastapi.testclient import TestClient
from app.api.v1.auth import router as auth_router
from app.models.user import User
from app.schemas.auth import UserCreate, UserResponse
from app.core.security import create_access_token
from app.database import get_db
from sqlalchemy.orm import Session
import pytest

app = FastAPI()
app.include_router(auth_router)

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def db_session():
    # Setup for database session
    db = get_db()
    yield db
    # Teardown for database session

def test_register(client: TestClient):
    response = client.post("/auth/register", json={"name": "Test User", "email": "test@example.com", "password": "password"})
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"

def test_login(client: TestClient):
    client.post("/auth/register", json={"name": "Test User", "email": "test@example.com", "password": "password"})
    response = client.post("/auth/login", data={"username": "test@example.com", "password": "password"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_credentials(client: TestClient):
    response = client.post("/auth/login", data={"username": "wrong@example.com", "password": "wrongpassword"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_refresh_token(client: TestClient):
    client.post("/auth/register", json={"name": "Test User", "email": "test@example.com", "password": "password"})
    login_response = client.post("/auth/login", data={"username": "test@example.com", "password": "password"})
    access_token = login_response.json()["access_token"]
    response = client.post("/auth/refresh", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200
    assert "access_token" in response.json()