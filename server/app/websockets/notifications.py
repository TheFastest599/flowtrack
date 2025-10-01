from fastapi import WebSocket, WebSocketDisconnect
from typing import List
from .connection_manager import ConnectionManager
from ..core.redis import redis_client

class NotificationManager:
    def __init__(self):
        self.manager = ConnectionManager()

    async def broadcast(self, message: str):
        await redis_client.publish("notifications", message)

    async def send_notification(self, websocket: WebSocket, message: str):
        await websocket.send_text(message)

    async def handle_notifications(self, websocket: WebSocket):
        await self.manager.connect(websocket)
        try:
            while True:
                message = await redis_client.get_message(ignore_subscribe_errors=True)
                if message:
                    await self.send_notification(websocket, message['data'])
        except WebSocketDisconnect:
            self.manager.disconnect(websocket)

notification_manager = NotificationManager()