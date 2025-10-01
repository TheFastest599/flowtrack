from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import auth, users, projects, tasks, reports
from app.database import init_db, close_db
from app.core.config import settings
from app.core.redis import redis_client
from app.services.notification_service import notification_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events."""
    # Startup
    print("🚀 Starting FlowTrack API...")
    await redis_client.connect()
    await init_db()
    print("✅ Application started successfully")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down FlowTrack API...")
    await redis_client.disconnect()
    await close_db()
    print("✅ Application shut down successfully")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Enterprise Project & Task Management System with Real-time Updates",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])


# WebSocket endpoint for real-time notifications
@app.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time notifications via Redis Pub/Sub."""
    await notification_service.connect(websocket, user_id)
    
    try:
        # Start listening to Redis Pub/Sub
        await notification_service.listen_to_redis(websocket, user_id)
    except WebSocketDisconnect:
        notification_service.disconnect(user_id)
        print(f"WebSocket disconnected: {user_id}")
    except Exception as e:
        print(f"WebSocket error for {user_id}: {e}")
        notification_service.disconnect(user_id)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to FlowTrack API",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


