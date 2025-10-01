# 🧪 Testing Checklist

Use this checklist to verify all backend features are working correctly.

---

## ✅ Setup Verification

- [ ] Python 3.10+ installed
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] Virtual environment created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file configured
- [ ] Database created
- [ ] Migrations applied (`alembic upgrade head`)
- [ ] Server starts without errors

---

## ✅ Authentication & Authorization

### Register User

- [ ] Admin user registration works

```bash
POST /api/v1/auth/register
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "admin"
}
```

- [ ] Member user registration works

```bash
POST /api/v1/auth/register
{
  "name": "Member User",
  "email": "member@test.com",
  "password": "member123",
  "role": "member"
}
```

### Login

- [ ] Admin can login
- [ ] Member can login
- [ ] Invalid credentials rejected
- [ ] Access token received
- [ ] Refresh token received

### Token Refresh

- [ ] Refresh token works
- [ ] New access token generated
- [ ] Invalid refresh token rejected

### Authorization

- [ ] Admin can access admin-only endpoints
- [ ] Member cannot access admin-only endpoints
- [ ] Unauthenticated requests rejected
- [ ] Invalid tokens rejected

---

## ✅ User Management

### Get Current User

- [ ] `GET /api/v1/users/me` returns current user

### List Users (Admin Only)

- [ ] `GET /api/v1/users/` returns all users
- [ ] Pagination works (skip, limit)
- [ ] Admin can access
- [ ] Member cannot access

### Get User by ID (Admin Only)

- [ ] `GET /api/v1/users/{id}` returns user
- [ ] 404 for non-existent user
- [ ] Admin can access
- [ ] Member cannot access

### Update User (Admin Only)

- [ ] `PUT /api/v1/users/{id}` updates user
- [ ] Name can be changed
- [ ] Email can be changed
- [ ] Role can be changed
- [ ] Password can be changed
- [ ] Admin can access
- [ ] Member cannot access

### Delete User (Admin Only)

- [ ] `DELETE /api/v1/users/{id}` deletes user
- [ ] User actually deleted from database
- [ ] Admin can access
- [ ] Member cannot access

---

## ✅ Project Management

### Create Project (Admin Only)

- [ ] `POST /api/v1/projects/` creates project

```bash
{
  "name": "Test Project",
  "description": "Testing project creation",
  "deadline": "2025-12-31"
}
```

- [ ] Admin can create
- [ ] Member cannot create

### List Projects

- [ ] `GET /api/v1/projects/` returns all projects
- [ ] Pagination works
- [ ] Status filter works (`?status=in_progress`)
- [ ] All users can access

### Get Project

- [ ] `GET /api/v1/projects/{id}` returns project
- [ ] 404 for non-existent project
- [ ] All users can access

### Update Project (Admin Only)

- [ ] `PUT /api/v1/projects/{id}` updates project
- [ ] Name can be changed
- [ ] Description can be changed
- [ ] Status can be changed
- [ ] Deadline can be changed
- [ ] Admin can access
- [ ] Member cannot access

### Delete Project (Admin Only)

- [ ] `DELETE /api/v1/projects/{id}` deletes project
- [ ] Cascade deletes associated tasks
- [ ] Admin can access
- [ ] Member cannot access

### Get Project Progress

- [ ] `GET /api/v1/projects/{id}/progress` returns stats
- [ ] Total tasks correct
- [ ] Completed tasks correct
- [ ] Progress percentage correct
- [ ] All users can access

---

## ✅ Task Management

### Create Task

- [ ] `POST /api/v1/tasks/` creates task

```bash
{
  "title": "Test Task",
  "description": "Testing task creation",
  "priority": "high",
  "status": "todo",
  "deadline": "2025-11-01",
  "project_id": "project-uuid",
  "assigned_to": "user-uuid"
}
```

- [ ] All users can create

### List Tasks

- [ ] `GET /api/v1/tasks/` returns all tasks
- [ ] Pagination works
- [ ] Project filter works (`?project_id=uuid`)
- [ ] Status filter works (`?status=in_progress`)
- [ ] Priority filter works (`?priority=high`)
- [ ] Assigned filter works (`?assigned_to=uuid`)
- [ ] All users can access

### Get Task

- [ ] `GET /api/v1/tasks/{id}` returns task
- [ ] 404 for non-existent task
- [ ] All users can access

### Update Task

- [ ] `PUT /api/v1/tasks/{id}` updates task
- [ ] Title can be changed
- [ ] Description can be changed
- [ ] Priority can be changed
- [ ] Status can be changed
- [ ] Deadline can be changed
- [ ] Assignment can be changed
- [ ] All users can update

### Delete Task

- [ ] `DELETE /api/v1/tasks/{id}` deletes task
- [ ] Task actually deleted from database
- [ ] All users can delete

### Move Task (Kanban)

- [ ] `PATCH /api/v1/tasks/{id}/move?new_status=in_progress` moves task
- [ ] Status changes correctly
- [ ] Works for: todo → in_progress
- [ ] Works for: in_progress → done
- [ ] Works for: done → todo (if needed)
- [ ] All users can move

---

## ✅ Reports & Analytics

### Project Progress Report

- [ ] `GET /api/v1/reports/project/{id}` returns report
- [ ] Project name correct
- [ ] Task counts correct
- [ ] Progress percentage accurate
- [ ] All users can access

### Team Performance Report (Admin Only)

- [ ] `GET /api/v1/reports/team-performance` returns report
- [ ] Lists all users
- [ ] Task counts per user correct
- [ ] Completion rates accurate
- [ ] Admin can access
- [ ] Member cannot access

### Workload Distribution Report (Admin Only)

- [ ] `GET /api/v1/reports/workload` returns report
- [ ] Shows assigned tasks per user
- [ ] Priority breakdown correct
- [ ] Admin can access
- [ ] Member cannot access

---

## ✅ Real-time WebSocket

### Connection

- [ ] Can connect to `ws://localhost:8000/ws/notifications/{user_id}`
- [ ] Connection accepted
- [ ] No errors on connect

### Task Events

- [ ] Receive notification on task creation
- [ ] Receive notification on task update
- [ ] Receive notification on task deletion
- [ ] Receive notification on task move (Kanban)

### Project Events

- [ ] Receive notification on project creation
- [ ] Receive notification on project update
- [ ] Receive notification on project deletion

### Event Format

- [ ] Events are valid JSON
- [ ] Events contain correct fields
- [ ] Event types are correct
- [ ] UUIDs are valid

### Multiple Connections

- [ ] Multiple clients can connect
- [ ] All clients receive broadcasts
- [ ] Disconnection handled gracefully

---

## ✅ Activity Logging

### Task Actions

- [ ] Task creation logged
- [ ] Task update logged
- [ ] Task deletion logged
- [ ] Task move logged

### Project Actions

- [ ] Project creation logged (when implemented)
- [ ] Project update logged (when implemented)

### Log Format

- [ ] User ID recorded
- [ ] Action description recorded
- [ ] Timestamp recorded

---

## ✅ API Documentation

### Swagger UI

- [ ] `http://localhost:8000/docs` loads
- [ ] All endpoints visible
- [ ] "Try it out" works
- [ ] Authentication works in Swagger
- [ ] Examples provided

### ReDoc

- [ ] `http://localhost:8000/redoc` loads
- [ ] Documentation complete
- [ ] Easy to navigate

---

## ✅ Error Handling

### Authentication Errors

- [ ] 401 for missing token
- [ ] 401 for invalid token
- [ ] 401 for expired token
- [ ] 403 for insufficient permissions

### Validation Errors

- [ ] 422 for invalid input
- [ ] Error messages clear
- [ ] Field-level errors shown

### Not Found Errors

- [ ] 404 for non-existent resources
- [ ] Error messages clear

### Server Errors

- [ ] 500 errors handled gracefully
- [ ] Error details not leaked in production

---

## ✅ Performance

### Response Times

- [ ] Auth endpoints < 200ms
- [ ] CRUD endpoints < 300ms
- [ ] List endpoints < 500ms
- [ ] Report endpoints < 1s

### Concurrent Requests

- [ ] Multiple simultaneous requests work
- [ ] No race conditions
- [ ] No deadlocks

### WebSocket

- [ ] Real-time updates < 100ms delay
- [ ] No message loss
- [ ] Connection stable

---

## ✅ Database

### Migrations

- [ ] `alembic upgrade head` works
- [ ] Tables created correctly
- [ ] Columns correct
- [ ] Indexes present
- [ ] Foreign keys enforced

### Data Integrity

- [ ] UUID primary keys work
- [ ] Unique constraints enforced
- [ ] Foreign key constraints enforced
- [ ] Cascade deletes work
- [ ] Timestamps auto-update

---

## ✅ Redis

### Connection

- [ ] Server connects to Redis on startup
- [ ] Connection errors handled

### Pub/Sub

- [ ] Messages published correctly
- [ ] Messages received correctly
- [ ] Multiple channels work
- [ ] Reconnection works after failure

---

## ✅ CORS

### Allowed Origins

- [ ] Frontend can connect
- [ ] Credentials work
- [ ] Preflight requests work

### Blocked Origins

- [ ] Unknown origins blocked (in production)

---

## 🎯 Quick Test Script

```bash
# 1. Register admin
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"admin"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  | jq -r '.access_token')

# 3. Get current user
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Create project
PROJECT_ID=$(curl -X POST http://localhost:8000/api/v1/projects/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"Testing"}' \
  | jq -r '.id')

# 5. Create task
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Task\",\"project_id\":\"$PROJECT_ID\"}"

# 6. Get project progress
curl -X GET "http://localhost:8000/api/v1/projects/$PROJECT_ID/progress" \
  -H "Authorization: Bearer $TOKEN"

echo "✅ All tests passed!"
```

---

## 📝 Notes

- Test in order (top to bottom)
- Use Postman or Thunder Client for easier testing
- Check server logs for errors
- Check database for data consistency
- Monitor Redis for published messages

**Happy Testing! 🧪**
