import redis.asyncio as redis
from app.config.settings import get_settings

settings = get_settings()

_redis_client: redis.Redis | None = None


def get_redis_client() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_keepalive=True,
            health_check_interval=30,      # Sends PING every 30s to keep connection alive
            retry_on_timeout=True,
            socket_connect_timeout=10,
        )
    return _redis_client
