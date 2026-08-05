import asyncio
import json

from app.core.redis_client import get_redis_client
from app.core.topics import RedisTopics
from app.schemas.redis_messages import PdfProcessRequestMessage
from app.services.pdf_processing_service import pdf_processing_service
from app.utils.logging import logger


async def run_pdf_worker() -> None:
    client = get_redis_client()
    pubsub = client.pubsub()
    await pubsub.subscribe(RedisTopics.PDF_PROCESS_REQUEST)
    logger.info(f"PDF worker subscribed to '{RedisTopics.PDF_PROCESS_REQUEST}'")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue

        try:
            payload = json.loads(message["data"])
            request = PdfProcessRequestMessage(**payload)
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Failed to parse pdf.process.request payload: {exc}")
            continue

        # Process each document independently without blocking the listen loop.
        asyncio.create_task(_process_and_respond(client, request))


async def _process_and_respond(client, request: PdfProcessRequestMessage) -> None:
    response = await pdf_processing_service.process(request)
    await client.publish(RedisTopics.PDF_PROCESS_RESPONSE, response.model_dump_json())
    logger.info(f"[{request.requestId}] Published pdf.process.response: {response.status}")
