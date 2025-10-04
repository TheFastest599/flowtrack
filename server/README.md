# FlowTrack Backend API

Enterprise Project & Task Management System with Real-time Updates using FastAPI, PostgreSQL, and Redis (Valkey).

## 🚀 Features

- **RESTful API** with FastAPI
- **Async/Await** support with SQLAlchemy 2.0
- **JWT Authentication** with access and refresh tokens
- **Role-Based Access Control** (Admin & Member)
- **Real-time Notifications** via WebSocket + Redis Pub/Sub
- **PostgreSQL Database** with Alembic migrations
- **Redis/Valkey** for Pub/Sub messaging and caching
- **Comprehensive API Documentation** (Swagger/OpenAPI)
- **Activity Logging** for audit trails
- **Kanban Board Support** with drag-and-drop task movement
- **Reports & Analytics** (Project progress, team performance, workload)

---

## 📋 Prerequisites

- **Python 3.10+**
- **PostgreSQL 14+**
- **Redis 7+** or **Valkey** (Redis fork)
- **pip** for package management

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
cd server
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration:

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://flowtrack_user:flowtrack_pass@localhost:5432/flowtrack_db

# Redis/Valkey Configuration (for Pub/Sub and caching)
REDIS_URL=redis://localhost:6379/0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Configuration
ALLOW_ORIGINS=["http://localhost:3000","http://localhost:3001"]

# Application Configuration
APP_NAME="FlowTrack API"
VERSION=1.0.0
DEBUG=True
```

### 5. Setup PostgreSQL Database

```bash
# Create database and user
psql -U postgres
CREATE DATABASE flowtrack_db;
CREATE USER flowtrack_user WITH PASSWORD 'flowtrack_pass';
GRANT ALL PRIVILEGES ON DATABASE flowtrack_db TO flowtrack_user;
\q
```

### 6. Setup Redis/Valkey

**Install Redis:**

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis
```

### 7. Run Database Migrations

```bash
# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

---

## 🏃 Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📡 WebSocket Connection

Connect to real-time notifications:

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/notifications/{user_id}");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Notification:", data);
};
```

### WebSocket Events

- `task_created` - New task created
- `task_updated` - Task updated
- `task_deleted` - Task deleted
- `task_moved` - Task status changed (Kanban)
- `project_created` - New project created
- `project_updated` - Project updated
- `project_deleted` - Project deleted

---

## 📚 API Documentation

The FlowTrack API is built with FastAPI and provides comprehensive REST endpoints for project and task management. All endpoints return JSON responses.

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### Authentication

All API endpoints (except authentication) require JWT token authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via login and can be refreshed using the refresh endpoint.

#### Register User

**POST** `/api/v1/auth/register`

Creates a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (201):**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

**Errors:**

- `400`: Invalid input data
- `409`: Email already registered

#### Login

**POST** `/api/v1/auth/login`

Authenticates a user and returns JWT tokens.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

**Errors:**

- `401`: Invalid credentials

#### Refresh Token

**POST** `/api/v1/auth/refresh`

Refreshes the access token using the refresh token stored in cookies.

**Response (200):**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

**Errors:**

- `401`: Refresh token missing or invalid

#### Logout

**POST** `/api/v1/auth/logout`

Clears the refresh token cookie.

**Response (204):** No content

### Users

#### Get Current User

**GET** `/api/v1/users/me`

Retrieves the current authenticated user's profile.

**Authentication:** Required

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "member",
  "created_at": "2023-10-01T10:00:00Z",
  "updated_at": "2023-10-01T10:00:00Z"
}
```

#### List Users

**GET** `/api/v1/users/`

Lists all users with optional filtering. Admin only.

**Authentication:** Required (Admin)

**Query Parameters:**

- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Maximum number of records to return (default: 100)
- `search` (str): Search by name or email
- `role` (str): Filter by role ("admin" or "member")

**Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "created_at": "2023-10-01T10:00:00Z",
    "updated_at": "2023-10-01T10:00:00Z"
  }
]
```

#### Get User by ID

**GET** `/api/v1/users/{user_id}`

Retrieves a specific user by ID. Admin only.

**Authentication:** Required (Admin)

**Response (200):** Same as current user response

**Errors:**

- `404`: User not found

#### Update User

**PUT** `/api/v1/users/{user_id}`

Updates a user's information. Admin only.

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin"
}
```

**Response (200):** Updated user object

**Errors:**

- `404`: User not found

#### Delete User

**DELETE** `/api/v1/users/{user_id}`

Deletes a user. Admin only.

**Authentication:** Required (Admin)

**Response (204):** No content

**Errors:**

- `404`: User not found

### Projects

#### Create Project

**POST** `/api/v1/projects/`

Creates a new project. Admin only.

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "name": "Website Redesign",
  "description": "Complete overhaul of company website",
  "deadline": "2023-12-31"
}
```

**Response (201):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Website Redesign",
  "description": "Complete overhaul of company website",
  "deadline": "2023-12-31",
  "status": "pending",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "creator_name": "John Doe",
  "created_at": "2023-10-01T10:00:00Z",
  "updated_at": "2023-10-01T10:00:00Z"
}
```

#### List Projects

**GET** `/api/v1/projects/`

Lists projects. Users see only their projects, admins see all.

**Authentication:** Required

**Query Parameters:**

- `skip` (int): Number of records to skip
- `limit` (int): Maximum number of records to return
- `status` (str): Filter by status ("pending", "in_progress", "completed")
- `query` (str): Search by name or description

**Response (200):** Array of project objects

#### Get Project

**GET** `/api/v1/projects/{project_id}`

Retrieves project details. Users can only access their projects, admins access all.

**Authentication:** Required

**Response (200):** Project object

**Errors:**

- `404`: Project not found or access denied

#### Update Project

**PUT** `/api/v1/projects/{project_id}`

Updates project information. Admins can update any project, members can update projects they belong to.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Website Redesign v2",
  "status": "in_progress"
}
```

**Response (200):** Updated project object

#### Delete Project

**DELETE** `/api/v1/projects/{project_id}`

Deletes a project. Admin only.

**Authentication:** Required (Admin)

**Response (204):** No content

#### Get Project Progress

**GET** `/api/v1/projects/{project_id}/progress`

Retrieves project progress statistics.

**Authentication:** Required

**Response (200):**

```json
{
  "total_tasks": 10,
  "completed_tasks": 3,
  "in_progress_tasks": 4,
  "todo_tasks": 3,
  "progress_percentage": 30.0
}
```

#### Add Member to Project

**POST** `/api/v1/projects/{project_id}/members/{user_id}`

Adds a user to a project. Admin only.

**Authentication:** Required (Admin)

**Response (201):**

```json
{
  "message": "Member added to project"
}
```

#### Remove Member from Project

**DELETE** `/api/v1/projects/{project_id}/members/{user_id}`

Removes a user from a project. Admin only.

**Authentication:** Required (Admin)

**Response (204):** No content

#### Get Project Members

**GET** `/api/v1/projects/{project_id}/members`

Lists project members with optional search.

**Authentication:** Required (Admin or project member)

**Query Parameters:**

- `search` (str): Search by name or email

**Response (200):** Array of user objects

### Tasks

#### Create Task

**POST** `/api/v1/tasks/`

Creates a new task. Users can create if they are project members, admins always.

**Authentication:** Required

**Request Body:**

```json
{
  "title": "Design homepage mockup",
  "description": "Create wireframes and mockups for the new homepage",
  "priority": "high",
  "status": "todo",
  "deadline": "2023-11-15",
  "project_id": "550e8400-e29b-41d4-a716-446655440001",
  "assigned_to": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201):** Task object

#### List Tasks

**GET** `/api/v1/tasks/`

Lists tasks. Users see only assigned tasks, admins see all.

**Authentication:** Required

**Query Parameters:**

- `skip` (int): Number of records to skip
- `limit` (int): Maximum number of records to return
- `project_id` (str): Filter by project UUID
- `status` (str): Filter by status ("todo", "in_progress", "done")
- `priority` (str): Filter by priority ("low", "medium", "high")
- `assigned_to` (str): Filter by assigned user UUID

**Response (200):** Array of task objects

#### Get Task

**GET** `/api/v1/tasks/{task_id}`

Retrieves task details. Users can only access assigned tasks, admins access all.

**Authentication:** Required

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "title": "Design homepage mockup",
  "description": "Create wireframes and mockups for the new homepage",
  "priority": "high",
  "status": "todo",
  "deadline": "2023-11-15",
  "project_id": "550e8400-e29b-41d4-a716-446655440001",
  "assigned_to": "550e8400-e29b-41d4-a716-446655440000",
  "assigned_to_name": "John Doe",
  "created_at": "2023-10-01T10:00:00Z",
  "updated_at": "2023-10-01T10:00:00Z"
}
```

#### Update Task

**PUT** `/api/v1/tasks/{task_id}`

Updates task information. Only assignee or admin.

**Authentication:** Required

**Request Body:**

```json
{
  "title": "Design homepage mockup v2",
  "status": "in_progress"
}
```

**Response (200):** Updated task object

#### Delete Task

**DELETE** `/api/v1/tasks/{task_id}`

Deletes a task. Only assignee or admin.

**Authentication:** Required

**Response (204):** No content

#### Move Task

**PATCH** `/api/v1/tasks/{task_id}/move`

Moves a task to a new status (Kanban drag-and-drop). Only assignee or admin.

**Authentication:** Required

**Request Body:**

```json
{
  "new_status": "in_progress"
}
```

**Response (200):** Updated task object

### Reports

#### Get Project Progress Report

**GET** `/api/v1/reports/project/{project_id}`

Retrieves detailed project progress report.

**Authentication:** Required

**Response (200):**

```json
{
  "project_id": "550e8400-e29b-41d4-a716-446655440001",
  "project_name": "Website Redesign",
  "total_tasks": 10,
  "completed_tasks": 3,
  "in_progress_tasks": 4,
  "todo_tasks": 3,
  "progress_percentage": 30.0
}
```

#### Get Team Performance Report

**GET** `/api/v1/reports/team-performance`

Retrieves team performance metrics. Admin only.

**Authentication:** Required (Admin)

**Response (200):**

```json
[
  {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_name": "John Doe",
    "total_tasks": 15,
    "completed_tasks": 12,
    "in_progress_tasks": 2,
    "todo_tasks": 1,
    "completion_rate": 80.0
  }
]
```

#### Get Workload Distribution Report

**GET** `/api/v1/reports/workload`

Retrieves workload distribution by user. Admin only.

**Authentication:** Required (Admin)

**Response (200):**

```json
[
  {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_name": "John Doe",
    "assigned_tasks": 8,
    "high_priority_tasks": 3,
    "medium_priority_tasks": 4,
    "low_priority_tasks": 1
  }
]
```

### Dashboard

#### Get Dashboard Data

**GET** `/api/v1/dashboard/`

Retrieves personalized dashboard data for the current user.

**Authentication:** Required

**Response (200):**

```json
{
  "recent_tasks": [...],
  "project_progress": [...],
  "notifications": [...]
}
```

---

## 🧪 API Testing

### cURL Examples

#### Register a new user:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login and get token:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Get current user (replace TOKEN with actual token):

```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer TOKEN"
```

#### Create a project (Admin only):

```bash
curl -X POST "http://localhost:8000/api/v1/projects/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Project description"
  }'
```

### Postman Collection

Import the OpenAPI schema from `http://localhost:8000/openapi.json` into Postman for automatic collection generation.

### WebSocket Testing

Connect to real-time notifications:

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/notifications/YOUR_USER_ID");

ws.onopen = () => console.log("Connected to WebSocket");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Notification:", data);
};
ws.onclose = () => console.log("WebSocket connection closed");
```

WebSocket events include:

- `task_created`, `task_updated`, `task_deleted`, `task_moved`
- `project_created`, `project_updated`, `project_deleted`

### Integration Testing

Run the test suite:

```bash
pytest tests/ -v
```

Test with coverage:

```bash
pytest --cov=app --cov-report=html
```

---

## 🗄️ Database Schema

### Users

- `id` (UUID, PK)
- `name`, `email`, `password_hash`
- `role` (admin | member)
- `created_at`, `updated_at`

### Projects

- `id` (UUID, PK)
- `name`, `description`, `deadline`
- `status` (pending | in_progress | completed)
- `created_by` (FK → users.id)
- `created_at`, `updated_at`

### Tasks

- `id` (UUID, PK)
- `title`, `description`
- `priority` (low | medium | high)
- `status` (todo | in_progress | done)
- `deadline`, `project_id` (FK), `assigned_to` (FK)
- `created_at`, `updated_at`

### Activity Logs

- `id` (UUID, PK)
- `user_id` (FK), `action`, `timestamp`

---

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

---

## 📦 Project Structure

```
server/
├── app/
│   ├── main.py              # FastAPI app & WebSocket
│   ├── database.py          # Async SQLAlchemy
│   ├── dependencies.py      # Auth dependencies
│   ├── api/v1/             # API routes
│   ├── core/               # Config, security, redis
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   └── websockets/         # WebSocket handlers
├── alembic/                # Database migrations
├── tests/                  # Tests
└── requirements.txt
```

---

## 🔧 Development Tools

```bash
# Code formatting
black app/
isort app/

# Linting
flake8 app/
mypy app/

# Create migration
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

---

## 📝 License

MIT License
