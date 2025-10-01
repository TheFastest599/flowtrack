from typing import List, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
from collections import defaultdict

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.topic_subscribers: Dict[str, List[str]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_message(self, user_id: str, message: str):
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_text(message)

    async def broadcast(self, message: str, topic: str):
        for user_id in self.topic_subscribers[topic]:
            websocket = self.active_connections.get(user_id)
            if websocket:
                await websocket.send_text(message)

    def subscribe(self, user_id: str, topic: str):
        if user_id not in self.topic_subscribers[topic]:
            self.topic_subscribers[topic].append(user_id)

    def unsubscribe(self, user_id: str, topic: str):
        if user_id in self.topic_subscribers[topic]:
            self.topic_subscribers[topic].remove(user_id)