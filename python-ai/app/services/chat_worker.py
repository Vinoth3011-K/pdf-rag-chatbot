import asyncio
import json

from app.core.redis_client import get_redis_client
from app.core.topics import RedisTopics
from app.schemas.redis_messages import ChatRequestMessage, ChatStreamChunkMessage
from app.services.chat_orchestration_service import chat_orchestration_service
from app.utils.logging import logger


async def run_chat_worker() -> None:
    client = get_redis_client()
    pubsub = client.pubsub()
    await pubsub.subscribe(RedisTopics.CHAT_REQUEST)
    logger.info(f"Chat worker subscribed to '{RedisTopics.CHAT_REQUEST}'")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue

        try:
            payload = json.loads(message["data"])
            request = ChatRequestMessage(**payload)
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Failed to parse chat.request payload: {exc}")
            continue

        asyncio.create_task(_handle_and_respond(client, request))


async def _handle_and_respond(client, request: ChatRequestMessage) -> None:
    async def on_token(token: str) -> None:
        chunk = ChatStreamChunkMessage(requestId=request.requestId, type="token", content=token)
        await client.publish(RedisTopics.CHAT_STREAM_CHUNK, chunk.model_dump_json())

    try:
        response = await chat_orchestration_service.handle_chat(request, on_token)
        await client.publish(RedisTopics.CHAT_RESPONSE, response.model_dump_json())
        logger.info(f"[{request.requestId}] Published chat.response")
    except Exception as exc:  # noqa: BLE001
        logger.exception(f"[{request.requestId}] Chat handling failed")
        error_chunk = ChatStreamChunkMessage(requestId=request.requestId, type="error", content=str(exc))
        await client.publish(RedisTopics.CHAT_STREAM_CHUNK, error_chunk.model_dump_json())
