# 🏗️ FlowTrack Backend Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Web App    │  │  Mobile App  │  │   Desktop    │              │
│  │  (React/     │  │  (React      │  │    App       │              │
│  │   Next.js)   │  │   Native)    │  │   (Electron) │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼──────────────────┼──────────────────┼──────────────────────┘
          │                  │                  │
          │    HTTP/REST     │    WebSocket     │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FASTAPI APPLICATION                           │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      CORS Middleware                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────┐         ┌─────────────────────────────┐   │
│  │   REST API Routes   │         │   WebSocket Endpoint        │   │
│  │  ┌───────────────┐  │         │  /ws/notifications/{user}   │   │
│  │  │ /auth/*       │  │         │                             │   │
│  │  │ /users/*      │  │         │  ┌────────────────────────┐ │   │
│  │  │ /projects/*   │  │         │  │ Connection Manager     │ │   │
│  │  │ /tasks/*      │  │         │  │ - Connect clients      │ │   │
│  │  │ /reports/*    │  │         │  │ - Disconnect clients   │ │   │
│  │  └───────────────┘  │         │  │ - Broadcast messages   │ │   │
│  └──────────┬──────────┘         │  └────────────────────────┘ │   │
│             │                     └──────────────┬──────────────┘   │
│             │                                    │                   │
│  ┌──────────▼────────────────────────────────────▼────────────────┐ │
│  │              Dependency Injection Layer                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │ │
│  │  │ get_db()     │  │get_current_  │  │ get_admin_user()    │  │ │
│  │  │ (DB Session) │  │  user()      │  │ (RBAC Check)        │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   Services Layer (Business Logic)               │ │
│  │                                                                  │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │ │
│  │  │   Auth     │  │   User     │  │  Project   │  │   Task   │ │ │
│  │  │  Service   │  │  Service   │  │  Service   │  │ Service  │ │ │
│  │  │            │  │            │  │            │  │          │ │ │
│  │  │ • Register │  │ • Create   │  │ • Create   │  │ • Create │ │ │
│  │  │ • Login    │  │ • Read     │  │ • Read     │  │ • Read   │ │ │
│  │  │ • Refresh  │  │ • Update   │  │ • Update   │  │ • Update │ │ │
│  │  │            │  │ • Delete   │  │ • Delete   │  │ • Delete │ │ │
│  │  │            │  │            │  │ • Progress │  │ • Move   │ │ │
│  │  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │ │
│  │                                                                  │ │
│  │  ┌────────────────────────────────────────────────────────────┐ │ │
│  │  │              Notification Service                           │ │ │
│  │  │  • WebSocket connection management                          │ │ │
│  │  │  • Redis Pub/Sub listener                                   │ │ │
│  │  │  • Broadcast to connected clients                           │ │ │
│  │  └────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                       Core Utilities                            │ │
│  │                                                                  │ │
│  │  ┌───────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │ │
│  │  │  Config   │  │  Security  │  │   Redis    │  │ Database  │ │ │
│  │  │           │  │            │  │   Client   │  │  Session  │ │ │
│  │  │ • Settings│  │ • JWT      │  │            │  │  Manager  │ │ │
│  │  │ • Env Vars│  │ • Hash     │  │ • Pub/Sub  │  │           │ │ │
│  │  │ • CORS    │  │ • Verify   │  │ • Cache    │  │ • Async   │ │ │
│  │  └───────────┘  └────────────┘  └────────────┘  └───────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Database Models (ORM)                        │ │
│  │                                                                  │ │
│  │  ┌─────────┐   ┌──────────┐   ┌────────┐   ┌──────────────┐   │ │
│  │  │  User   │   │ Project  │   │  Task  │   │ ActivityLog  │   │ │
│  │  │         │   │          │   │        │   │              │   │ │
│  │  │ • id    │───│• created │   │• proj  │   │• user_id     │   │ │
│  │  │ • email │1:N│  _by     │1:N│  _id   │   │• action      │   │ │
│  │  │ • role  │   │• status  │   │• status│   │• timestamp   │   │ │
│  │  └─────────┘   └──────────┘   └────────┘   └──────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────┬──────────────────────┘
                            │                   │
                ┌───────────▼──────┐   ┌────────▼────────┐
                │   PostgreSQL     │   │     Redis       │
                │   (Database)     │   │  (Pub/Sub +     │
                │                  │   │   Caching)      │
                │ • Async          │   │                 │
                │ • UUID PKs       │   │ • Real-time     │
                │ • Relationships  │   │ • Multi-worker  │
                │ • Migrations     │   │ • Scalable      │
                └──────────────────┘   └─────────────────┘
```

---

## Data Flow Diagrams

### 1. User Registration & Login Flow

```
┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
│  Client  │        │   API    │        │ Service  │        │ Database │
└────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │                   │
     │ POST /auth/       │                   │                   │
     │   register        │                   │                   │
     ├──────────────────►│                   │                   │
     │                   │ UserCreate        │                   │
     │                   ├──────────────────►│                   │
     │                   │                   │ hash_password()   │
     │                   │                   ├───────┐           │
     │                   │                   │       │           │
     │                   │                   │◄──────┘           │
     │                   │                   │                   │
     │                   │                   │ create_user()     │
     │                   │                   ├──────────────────►│
     │                   │                   │                   │
     │                   │                   │ User              │
     │                   │                   │◄──────────────────┤
     │                   │                   │                   │
     │                   │                   │ create_tokens()   │
     │                   │                   ├───────┐           │
     │                   │                   │       │           │
     │                   │                   │◄──────┘           │
     │                   │                   │                   │
     │                   │ {access, refresh} │                   │
     │                   │◄──────────────────┤                   │
     │                   │                   │                   │
     │ {tokens, user}    │                   │                   │
     │◄──────────────────┤                   │                   │
     │                   │                   │                   │
```

### 2. Protected Endpoint Access Flow

```
┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
│  Client  │        │   API    │        │  Auth    │        │ Database │
└────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │                   │
     │ GET /users/me     │                   │                   │
     │ Bearer: token     │                   │                   │
     ├──────────────────►│                   │                   │
     │                   │ verify_token()    │                   │
     │                   ├──────────────────►│                   │
     │                   │                   │ decode_jwt()      │
     │                   │                   ├───────┐           │
     │                   │                   │       │           │
     │                   │                   │◄──────┘           │
     │                   │                   │                   │
     │                   │                   │ get_user_by_email()
     │                   │                   ├──────────────────►│
     │                   │                   │                   │
     │                   │                   │ User              │
     │                   │                   │◄──────────────────┤
     │                   │                   │                   │
     │                   │ User              │                   │
     │                   │◄──────────────────┤                   │
     │                   │                   │                   │
     │ User data         │                   │                   │
     │◄──────────────────┤                   │                   │
     │                   │                   │                   │
```

### 3. Real-time Task Update Flow

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Client A │  │ Client B │  │   API    │  │  Redis   │  │ Database │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │              │             │             │
     │ WS Connect  │              │             │             │
     ├─────────────┼─────────────►│             │             │
     │             │              │ subscribe   │             │
     │             │              ├────────────►│             │
     │             │              │             │             │
     │             │ WS Connect   │             │             │
     │             ├─────────────►│             │             │
     │             │              │ subscribe   │             │
     │             │              ├────────────►│             │
     │             │              │             │             │
     │ POST /tasks │              │             │             │
     ├─────────────┼─────────────►│             │             │
     │             │              │ create_task()            │
     │             │              ├─────────────┼────────────►│
     │             │              │             │             │
     │             │              │             │ Task        │
     │             │              │◄────────────┼─────────────┤
     │             │              │             │             │
     │             │              │ publish()   │             │
     │             │              ├────────────►│             │
     │             │              │             │             │
     │             │              │       broadcast to subs   │
     │             │              │◄────────────┤             │
     │             │              │             │             │
     │ Notification│              │             │             │
     │◄────────────┤              │             │             │
     │             │              │             │             │
     │             │ Notification │             │             │
     │             │◄─────────────┤             │             │
     │             │              │             │             │
```

### 4. Kanban Task Move Flow

```
┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
│  Client  │        │   API    │        │  Redis   │        │   All    │
│          │        │          │        │ Pub/Sub  │        │ Clients  │
└────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │                   │
     │ PATCH /tasks/{id}/│                   │                   │
     │   move?status=... │                   │                   │
     ├──────────────────►│                   │                   │
     │                   │ update_task()     │                   │
     │                   ├───────┐           │                   │
     │                   │       │           │                   │
     │                   │◄──────┘           │                   │
     │                   │                   │                   │
     │                   │ log_activity()    │                   │
     │                   ├───────┐           │                   │
     │                   │       │           │                   │
     │                   │◄──────┘           │                   │
     │                   │                   │                   │
     │                   │ publish(          │                   │
     │                   │  "kanban_updates",│                   │
     │                   │  {task_moved}     │                   │
     │                   │ )                 │                   │
     │                   ├──────────────────►│                   │
     │                   │                   │                   │
     │                   │                   │ broadcast         │
     │                   │                   ├──────────────────►│
     │                   │                   │                   │
     │ Updated Task      │                   │                   │
     │◄──────────────────┤                   │                   │
     │                   │                   │                   │
```

---

## Component Interaction Matrix

| Component        | Interacts With              | Purpose              |
| ---------------- | --------------------------- | -------------------- |
| **API Routes**   | Services, Dependencies      | Handle HTTP requests |
| **WebSocket**    | Notification Service, Redis | Real-time updates    |
| **Services**     | Models, Redis, Database     | Business logic       |
| **Dependencies** | Security, Database          | Auth & injection     |
| **Models**       | Database                    | ORM mapping          |
| **Security**     | JWT, Bcrypt                 | Auth & encryption    |
| **Redis**        | Services, WebSocket         | Pub/Sub & caching    |
| **Database**     | Models, Services            | Data persistence     |

---

## Technology Stack Layers

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                  │
│  • FastAPI Routes                           │
│  • WebSocket Endpoints                      │
│  • Swagger/OpenAPI Docs                     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Business Logic Layer                │
│  • Services (Auth, User, Project, Task)     │
│  • Notification Service                     │
│  • Activity Logging                         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Data Access Layer                   │
│  • SQLAlchemy Models                        │
│  • Database Sessions (Async)                │
│  • Redis Client                             │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Infrastructure Layer                │
│  • PostgreSQL Database                      │
│  • Redis Server                             │
│  • Alembic Migrations                       │
└─────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌──────────────────────────────────────────────┐
│              Client Request                   │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│          CORS Middleware                      │
│  • Validate origin                            │
│  • Check credentials                          │
│  • Handle preflight                           │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│          JWT Validation                       │
│  • Extract Bearer token                       │
│  • Verify signature                           │
│  • Check expiration                           │
│  • Decode payload                             │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│          RBAC Authorization                   │
│  • Check user role                            │
│  • Verify permissions                         │
│  • Admin/Member enforcement                   │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│          Input Validation                     │
│  • Pydantic schemas                           │
│  • Type checking                              │
│  • Field validation                           │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│          Business Logic                       │
└──────────────────────────────────────────────┘
```

---

This architecture provides:

- ✅ Separation of concerns
- ✅ Scalability (horizontal with Redis)
- ✅ Security (JWT, RBAC, validation)
- ✅ Real-time capabilities
- ✅ Maintainability
- ✅ Testability
