# 🚀 Quick Start Guide

Get FlowTrack backend running in under 5 minutes!

---

## Option 1: Using Docker (Easiest)

### 1. Start PostgreSQL and Redis

```bash
cd server
docker-compose up -d
```

### 2. Install Python dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Setup environment

```bash
cp .env.example .env
# .env is already configured for Docker services
```

### 4. Run migrations

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 5. Start the server

```bash
uvicorn app.main:app --reload
```

Visit: http://localhost:8000/docs

---

## Option 2: Local Installation

### 1. Run setup script

```bash
cd server
chmod +x setup.sh
./setup.sh
```

### 2. Install PostgreSQL

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Create database

```bash
sudo -u postgres psql
CREATE DATABASE flowtrack_db;
CREATE USER flowtrack_user WITH PASSWORD 'flowtrack_pass';
GRANT ALL PRIVILEGES ON DATABASE flowtrack_db TO flowtrack_user;
\q
```

### 4. Install and start Redis

```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 5. Configure environment

```bash
cp .env.example .env
nano .env  # Edit with your settings
```

### 6. Run migrations

```bash
source venv/bin/activate
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 7. Start the server

```bash
uvicorn app.main:app --reload
```

---

## 🧪 Test the API

### 1. Register a user

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@flowtrack.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@flowtrack.com",
    "password": "admin123"
  }'
```

### 3. Use the access token

Copy the `access_token` from the response and use it in subsequent requests:

```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔌 Test WebSocket

Create an HTML file:

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>FlowTrack WebSocket Test</h1>
    <div id="messages"></div>

    <script>
      const ws = new WebSocket("ws://localhost:8000/ws/notifications/user-123");

      ws.onopen = () => {
        console.log("Connected to WebSocket");
        document.getElementById("messages").innerHTML += "<p>✅ Connected!</p>";
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Message:", data);
        document.getElementById(
          "messages"
        ).innerHTML += `<p>📨 ${JSON.stringify(data)}</p>`;
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    </script>
  </body>
</html>
```

---

## 📊 Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 🛑 Troubleshooting

### Port already in use

```bash
# Kill process on port 8000
sudo lsof -t -i:8000 | xargs kill -9
```

### Database connection error

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if database exists
psql -U flowtrack_user -d flowtrack_db -h localhost
```

### Redis connection error

```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis
redis-cli ping
```

### Migration errors

```bash
# Reset migrations
alembic downgrade base
alembic upgrade head
```

---

## 🎉 You're Ready!

Your backend is now running with:

- ✅ REST API endpoints
- ✅ WebSocket real-time notifications
- ✅ JWT authentication
- ✅ PostgreSQL database
- ✅ Redis Pub/Sub

Next: Connect your frontend to the API!
