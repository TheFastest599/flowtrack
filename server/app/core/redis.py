import json
from typing import Optional, Any
from redis.asyncio import Redis, from_url
from app.core.config import settings


class RedisClient:
    """Redis client for Pub/Sub and caching."""
    
    def __init__(self):
        self.redis: Optional[Redis] = None
        self.pubsub = None

    async def connect(self):
        """Connect to Redis."""
        self.redis = await from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        print(f"✅ Connected to Redis at {settings.REDIS_URL}")

    async def disconnect(self):
        """Disconnect from Redis."""
        if self.redis:
            await self.redis.close()
            print("✅ Disconnected from Redis")

    async def publish(self, channel: str, message: Any):
        """Publish a message to a Redis channel."""
        if self.redis:
            if isinstance(message, dict):
                message = json.dumps(message)
            await self.redis.publish(channel, message)

    async def subscribe(self, channel: str):
        """Subscribe to a Redis channel."""
        if self.redis:
            self.pubsub = self.redis.pubsub()
            await self.pubsub.subscribe(channel)
            return self.pubsub

    async def get_message(self, timeout: float = 1.0):
        """Get a message from subscribed channel."""
        if self.pubsub:
            message = await self.pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=timeout
            )
            return message
        return None

    async def unsubscribe(self, channel: str):
        """Unsubscribe from a channel."""
        if self.pubsub:
            await self.pubsub.unsubscribe(channel)

    # Cache operations
    async def set(self, key: str, value: Any, expire: Optional[int] = None):
        """Set a value in Redis cache."""
        if self.redis:
            if isinstance(value, dict):
                value = json.dumps(value)
            await self.redis.set(key, value, ex=expire)

    async def get(self, key: str) -> Optional[str]:
        """Get a value from Redis cache."""
        if self.redis:
            return await self.redis.get(key)
        return None

    async def delete(self, key: str):
        """Delete a key from Redis."""
        if self.redis:
            await self.redis.delete(key)


# Global Redis client instance
redis_client = RedisClient()