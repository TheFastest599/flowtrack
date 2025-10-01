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
DATABASE_URL=postgresql+asyncpg://flowtrack_user:flowtrack_pass@localhost:5432/flowtrack_db
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your-super-secret-jwt-key-change-this
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

## 🔐 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token

### Users

- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/` - List all users (Admin)
- `GET /api/v1/users/{id}` - Get user by ID (Admin)
- `PUT /api/v1/users/{id}` - Update user (Admin)
- `DELETE /api/v1/users/{id}` - Delete user (Admin)

### Projects

- `POST /api/v1/projects/` - Create project (Admin)
- `GET /api/v1/projects/` - List projects
- `GET /api/v1/projects/{id}` - Get project details
- `PUT /api/v1/projects/{id}` - Update project (Admin)
- `DELETE /api/v1/projects/{id}` - Delete project (Admin)
- `GET /api/v1/projects/{id}/progress` - Get project progress

### Tasks

- `POST /api/v1/tasks/` - Create task
- `GET /api/v1/tasks/` - List tasks (with filters)
- `GET /api/v1/tasks/{id}` - Get task details
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task
- `PATCH /api/v1/tasks/{id}/move` - Move task (Kanban)

### Reports

- `GET /api/v1/reports/project/{id}` - Project progress report
- `GET /api/v1/reports/team-performance` - Team performance (Admin)
- `GET /api/v1/reports/workload` - Workload distribution (Admin)

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
