from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import get_password_hash

app = FastAPI()

# Dependency to get the database session
def override_get_db():
    # This function should return a test database session
    pass

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_register_user():
    response = client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"

def test_login_user():
    response = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_current_user():
    # Assuming we have a valid JWT token
    token = "valid_jwt_token"
    response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_list_users(admin_token):
    response = client.get("/users/", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_user(admin_token):
    user_id = "some_user_id"
    response = client.put(f"/users/{user_id}", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "name": "Updated User"
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Updated User"

def test_delete_user(admin_token):
    user_id = "some_user_id"
    response = client.delete(f"/users/{user_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 204

def test_user_creation_with_existing_email():
    response = client.post("/auth/register", json={
        "name": "Another User",
        "email": "test@example.com",  # Duplicate email
        "password": "password123"
    })
    assert response.status_code == 400
    assert "detail" in response.json()  # Expecting a validation error message