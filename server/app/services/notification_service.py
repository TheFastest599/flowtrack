from typing import Any, Dict
from fastapi import WebSocket
import json
import asyncio

from app.core.redis import redis_client


class NotificationService:
    """Service for managing real-time notifications via WebSocket and Redis Pub/Sub."""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.subscribed_channels = ["task_updates", "project_updates", "kanban_updates", "notifications"]

    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a WebSocket client."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"✅ WebSocket connected: User {user_id}")

    def disconnect(self, user_id: str):
        """Disconnect a WebSocket client."""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"❌ WebSocket disconnected: User {user_id}")

    async def send_personal_message(self, user_id: str, message: dict):
        """Send a message to a specific user."""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id)

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients."""
        disconnected = []
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to {user_id}: {e}")
                disconnected.append(user_id)
        
        # Clean up disconnected clients
        for user_id in disconnected:
            self.disconnect(user_id)

    
    async def listen_to_redis(self, websocket: WebSocket, user_id: str):
        """Listen to Redis Pub/Sub and forward messages to WebSocket client."""
        # Subscribe to all channels
        pubsub = await redis_client.subscribe(*self.subscribed_channels)
        
        try:
            while True:
                # Use pubsub to get messages from subscribed channels
                message = await pubsub.get_message(timeout=1.0)
                
                if message and message.get('type') == 'message':
                    try:
                        data = json.loads(message['data'])
                        await self.send_personal_message(user_id, data)
                    except json.JSONDecodeError:
                        # If not JSON, send as plain text
                        await self.send_personal_message(user_id, {
                            "type": "notification",
                            "message": message['data']
                        })
                
                # Small delay to prevent CPU spinning
                await asyncio.sleep(0.1)
                
        except Exception as e:
            print(f"Error in Redis listener for user {user_id}: {e}")
        finally:
            # Cleanup
            await pubsub.unsubscribe(*self.subscribed_channels)
            self.disconnect(user_id)
    
    
    async def publish_notification(self, channel: str, message: dict):
        """Publish a notification to a Redis channel."""
        await redis_client.publish(channel, message)


# Global notification service instance
notification_service = NotificationService()