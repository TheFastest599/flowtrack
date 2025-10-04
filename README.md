# FlowTrack

A comprehensive full-stack project and task management application built with modern web technologies. FlowTrack helps teams collaborate effectively by providing tools for project management, task tracking, team coordination, and performance analytics.

![FlowTrack Logo](https://img.shields.io/badge/FlowTrack-Project%20Management-blue?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## 🌟 Overview

FlowTrack is an enterprise-grade project management solution that combines the power of modern web technologies with real-time collaboration features. The application provides a seamless experience for managing projects, tracking tasks, coordinating teams, and generating insightful reports.

### Key Highlights

- **Real-time Collaboration**: WebSocket-powered notifications and live updates
- **Role-Based Access Control**: Secure admin and member role management
- **Kanban Board**: Visual task management with drag-and-drop functionality
- **Advanced Analytics**: Comprehensive reporting and performance metrics
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Built with shadcn/ui components and Tailwind CSS

## 🏗️ Architecture

FlowTrack follows a modern full-stack architecture:

```
┌─────────────────┐    REST API    ┌─────────────────┐
│   Next.js       │◄─────────────►│    FastAPI      │
│   Frontend      │   WebSocket    │    Backend      │
│   (React)       │◄─────────────►│   (Python)      │
└─────────────────┘                └─────────────────┘
         │                                 │
         └─────────────► PostgreSQL ◄──────┘
                                 │
                                 ▼
                            Redis/Valkey
                           (Pub/Sub & Cache)
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14+ with App Router
- **UI Library**: React 18+ with TypeScript support
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: JWT with automatic token refresh
- **Forms**: React Hook Form + Zod validation
- **Real-time**: WebSocket client for live updates

### Backend

- **Framework**: FastAPI (Python async web framework)
- **Database**: PostgreSQL with SQLAlchemy 2.0 ORM
- **Authentication**: JWT tokens with role-based access control
- **Real-time**: WebSocket with Redis Pub/Sub
- **Caching**: Redis/Valkey for session and data caching
- **Migrations**: Alembic for database schema management
- **Documentation**: Auto-generated OpenAPI/Swagger docs

### DevOps & Tools

- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 14+
- **Cache/Message Broker**: Redis 7+ or Valkey
- **Testing**: pytest for backend, Jest/React Testing Library for frontend
- **Linting**: ESLint (frontend), Black/isort (backend)
- **API Testing**: Postman/Insomnia collections

## ✨ Features

### 👥 User Management

- Secure user authentication and registration
- Role-based access control (Admin/Member)
- User profile management
- Team member directory

### 📊 Project Management

- Create and manage multiple projects
- Project progress tracking and analytics
- Member assignment and team coordination
- Project status management (Pending → In Progress → Completed)

### ✅ Task Management

- Comprehensive task creation and editing
- Task assignment to team members
- Priority levels (Low, Medium, High)
- Status tracking (To Do, In Progress, Done)
- Kanban board with drag-and-drop functionality
- Advanced filtering and search capabilities

### 📈 Reports & Analytics

- Project progress reports
- Team performance metrics
- Workload distribution analysis
- Activity logging and audit trails

### 🔄 Real-time Features

- Live notifications for task updates
- Real-time project progress updates
- WebSocket-powered collaboration
- Instant feedback on user actions

### 🎨 User Experience

- Responsive design for all screen sizes
- Intuitive navigation with sidebar
- Dark/light theme support
- Loading states and error handling
- Toast notifications for user feedback

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm/yarn/pnpm**
- **Python 3.10+** and **pip**
- **PostgreSQL 14+**
- **Redis 7+** or **Valkey**
- **Docker** (optional, for containerized setup)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flowtrack
```

### 2. Backend Setup

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb flowtrack_db

# Run migrations
alembic upgrade head
```

### 4. Redis Setup

```bash
# Install and start Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 5. Environment Configuration

```bash
# Backend (.env)
cp server/.env.example server/.env
# Edit server/.env with your database and Redis URLs

# Frontend (.env.local)
cp client/.env.example client/.env.local
# Edit client/.env.local with API URLs
```

### 6. Start the Application

```bash
# Terminal 1: Start Backend
cd server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Frontend
cd client
npm install
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
flowtrack/
├── client/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and API clients
│   │   ├── stores/        # Zustand state stores
│   │   └── hooks/         # Custom React hooks
│   ├── public/            # Static assets
│   └── README.md          # Frontend documentation
├── server/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/           # API route handlers
│   │   ├── core/          # Core functionality
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── websockets/    # WebSocket handlers
│   ├── tests/             # Test suite
│   ├── alembic/           # Database migrations
│   └── README.md          # Backend documentation
├── docker-compose.yml     # Docker orchestration
├── README.md             # This file
└── docs/                 # Additional documentation
```

## 🔌 API Reference

### Authentication Endpoints

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/refresh` - Token refresh

### Core Endpoints

- `GET /api/v1/users/me` - Current user profile
- `GET /api/v1/projects` - List user projects
- `GET /api/v1/tasks` - List tasks with filtering
- `GET /api/v1/reports/projects` - Project analytics

### Admin Endpoints

- `GET /api/v1/users` - User management (admin only)
- `POST /api/v1/projects` - Create projects (admin only)
- `POST /api/v1/tasks` - Create tasks (admin only)

For complete API documentation, visit `http://localhost:8000/docs` when the backend is running.

## 🧪 Testing

### Backend Tests

```bash
cd server
pytest tests/ -v
```

### Frontend Tests

```bash
cd client
npm test
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build
```

### Manual Deployment

1. Configure production environment variables
2. Build frontend: `npm run build`
3. Start backend with production ASGI server (e.g., Gunicorn)
4. Serve frontend with Next.js production server or static hosting

### Environment Variables

#### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost/flowtrack_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret
JWT_REFRESH_SECRET_KEY=your-refresh-secret
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_APP_NAME=FlowTrack
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_DEBUG=true
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m 'Add some feature'`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** for the excellent async web framework
- **Next.js** for the powerful React framework
- **shadcn/ui** for the beautiful component library
- **PostgreSQL** for the robust database
- **Redis** for caching and real-time features

## 📞 Support

If you have questions or need help:

- Check the [Issues](https://github.com/your-repo/issues) page
- Read the [Documentation](./docs/)
- Join our [Discord Community](https://discord.gg/flowtrack)

---

**FlowTrack** - Streamlining project management, one task at a time. 🚀
