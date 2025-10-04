# FlowTrack Frontend

A modern React frontend for FlowTrack, a comprehensive project and task management application built with Next.js.

## Overview

FlowTrack is a full-stack application that helps teams manage projects, track tasks, and collaborate effectively. This frontend provides a beautiful, responsive interface for project management with role-based access control.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **UI Library**: React 18+
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: JWT tokens with automatic refresh
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

## Features

### User Management

- User authentication (login/signup)
- Role-based access control (Admin/Member)
- User profiles and management
- Team member overview

### Project Management

- Create and manage projects
- Project progress tracking
- Member assignment to projects
- Project status management

### Task Management

- Create, edit, and delete tasks
- Task assignment to team members
- Priority and status management
- Kanban board view
- Task filtering and search

### Dashboard & Reports

- Project overview dashboard
- Team performance reports
- Workload analysis
- Progress tracking

### Additional Features

- Real-time notifications (WebSocket)
- Responsive design for all devices
- Dark/light theme support
- Offline-capable interface

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Backend server running (see server README)

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_WS_BASE_SECURE=wss://localhost:8000/ws
NEXT_PUBLIC_APP_NAME=FlowTrack
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_DEBUG=true
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── members/           # User management
│   ├── projects/          # Project management
│   ├── tasks/             # Task management
│   └── reports/           # Reports and analytics
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── AppSidebar.jsx    # Main navigation sidebar
│   ├── ProtectedRoute.jsx # Route protection
│   └── ...
├── lib/                  # Utilities and configurations
│   ├── api/              # API client functions
│   ├── utils.js          # Helper functions
│   └── react-query.js    # Query client setup
├── stores/               # Zustand state stores
│   ├── authStore.js      # Authentication state
│   └── notificationStore.js # Notifications
└── hooks/                # Custom React hooks
```

## API Integration

The frontend communicates with the FastAPI backend through RESTful APIs:

### Authentication

- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/refresh` - Token refresh

### Users

- `GET /users/me` - Current user profile
- `GET /users` - List users (admin only)
- `GET /users/{id}` - Get user details (admin only)
- `PUT /users/{id}` - Update user (admin only)
- `DELETE /users/{id}` - Delete user (admin only)

### Projects

- `GET /projects` - List projects
- `POST /projects` - Create project (admin only)
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project (admin only)

### Tasks

- `GET /tasks` - List tasks with filtering
- `POST /tasks` - Create task (admin only)
- `GET /tasks/{id}` - Get task details
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task (admin only)

### Reports

- `GET /reports/projects` - Project progress reports
- `GET /reports/team` - Team performance reports

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks (if using TS)

### Code Style

This project uses ESLint for code linting. Make sure to run `npm run lint` before committing.

### State Management

The app uses Zustand for global state management:

- **authStore**: Handles authentication state and user data
- **notificationStore**: Manages real-time notifications

### Data Fetching

TanStack Query is used for server state management:

- Automatic caching and background refetching
- Optimistic updates for better UX
- Error handling and retry logic

### Authentication Flow

1. User logs in → JWT tokens stored in localStorage
2. Tokens automatically refreshed before expiration
3. Protected routes check authentication status
4. Admin-only features check user role

## Deployment

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com/ws
NEXT_PUBLIC_WS_BASE_SECURE=wss://your-api-domain.com/ws
NEXT_PUBLIC_APP_NAME=FlowTrack
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_DEBUG=false
```

### Build Optimization

- Static generation for public pages
- Dynamic imports for code splitting
- Image optimization with Next.js Image component
- CSS optimization with Tailwind

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is part of the FlowTrack application. See the main project license for details.
