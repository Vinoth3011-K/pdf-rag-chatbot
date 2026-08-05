import asyncio
import json

from app.core.redis_client import get_redis_client
from app.core.topics import RedisTopics
from app.modules.vector_store import vector_store
from app.schemas.redis_messages import PdfProcessRequestMessage
from app.services.pdf_processing_service import pdf_processing_service
from app.utils.logging import logger


async def run_pdf_worker() -> None:
    client = get_redis_client()
    pubsub = client.pubsub()
    await pubsub.subscribe(RedisTopics.PDF_PROCESS_REQUEST, RedisTopics.PDF_DELETE_REQUEST)
    logger.info(f"PDF worker subscribed to '{RedisTopics.PDF_PROCESS_REQUEST}' and '{RedisTopics.PDF_DELETE_REQUEST}'")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue

        topic = message["channel"]
        if isinstance(topic, bytes):
            topic = topic.decode()

        try:
            payload = json.loads(message["data"])
        except Exception as exc:
            logger.error(f"Failed to parse payload on {topic}: {exc}")
            continue

        if topic == RedisTopics.PDF_DELETE_REQUEST:
            document_id = payload.get("documentId")
            if document_id:
                vector_store.delete_document(document_id)
                logger.info(f"Deleted vectors for document {document_id}")
            continue

        try:
            request = PdfProcessRequestMessage(**payload)
        except Exception as exc:
            logger.error(f"Failed to parse pdf.process.request payload: {exc}")
            continue

        asyncio.create_task(_process_and_respond(client, request))


async def _process_and_respond(client, request: PdfProcessRequestMessage) -> None:
    response = await pdf_processing_service.process(request)
    await client.publish(RedisTopics.PDF_PROCESS_RESPONSE, response.model_dump_json())
    logger.info(f"[{request.requestId}] Published pdf.process.response: {response.status}")
