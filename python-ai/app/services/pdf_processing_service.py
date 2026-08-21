import asyncio
import os
import tempfile
import httpx

from app.modules.chunking import text_chunker
from app.modules.pdf_loader import pdf_loader
from app.modules.vector_store import vector_store
from app.schemas.redis_messages import (
    PdfProcessRequestMessage,
    PdfProcessResponseMessage
)
from app.utils.logging import logger


class PdfProcessingService:

    async def process(
        self,
        request: PdfProcessRequestMessage
    ) -> PdfProcessResponseMessage:

        temp_file_path = None
        try:

            logger.info(
                f"[{request.requestId}] Processing PDF from URL: {request.fileUrl} (doc: {request.documentId})"
            )

            # Download PDF from fileUrl with retry logic
            pdf_bytes = None
            max_retries = 3
            headers = {"User-Agent": "PDF-RAG-Python-AI/1.0"}

            async with httpx.AsyncClient(timeout=60.0, follow_redirects=True, headers=headers) as client:
                for attempt in range(1, max_retries + 1):
                    try:
                        logger.info(f"[{request.requestId}] Attempt {attempt}/{max_retries}: Fetching {request.fileUrl}")
                        response = await client.get(request.fileUrl)
                        if response.status_code == 200:
                            pdf_bytes = response.content
                            break
                        else:
                            logger.warning(
                                f"[{request.requestId}] Download attempt {attempt} returned HTTP {response.status_code}: {response.text[:200]}"
                            )
                    except httpx.RequestError as req_err:
                        logger.warning(f"[{request.requestId}] Download attempt {attempt} failed with network error: {req_err}")

                    if attempt < max_retries:
                        await asyncio.sleep(2 * attempt)

            if not pdf_bytes:
                raise ValueError(
                    f"Failed to download PDF from {request.fileUrl} after {max_retries} attempts"
                )

            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(pdf_bytes)
                temp_file_path = tmp_file.name

            # Extract PDF pages
            pages = pdf_loader.load(
                temp_file_path
            )

            if not pages:
                raise ValueError(
                    "No extractable text found in PDF"
                )

            logger.info(
                f"[{request.documentId}] Extracted {len(pages)} pages"
            )

            # Create chunks
            chunks = text_chunker.chunk_pages(
                request.documentId,
                pages
            )

            logger.info(
                f"[{request.documentId}] Created {len(chunks)} chunks"
            )

            # Keep original uploaded PDF name
            document_title = (
                request.documentTitle
                if request.documentTitle
                else os.path.basename(request.fileUrl.split("?")[0])
            )

            logger.info(
                f"[{request.documentId}] Document title: {document_title}"
            )

            # Remove old vectors before re-upload
            vector_store.delete_document(
                request.documentId
            )

            # Save vectors into Chroma
            vector_store.upsert_chunks(
                request.documentId,
                document_title,
                chunks
            )

            logger.info(
                f"[{request.documentId}] Vector upload completed"
            )

            return PdfProcessResponseMessage(
                requestId=request.requestId,
                documentId=request.documentId,
                status="READY",
                pageCount=len(pages),
                chunkCount=len(chunks),
            )

        except Exception as exc:

            logger.exception(
                f"Failed to process document {request.documentId}: {exc}"
            )

            return PdfProcessResponseMessage(
                requestId=request.requestId,
                documentId=request.documentId,
                status="FAILED",
                errorMessage=str(exc),
            )

        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except Exception as cleanup_err:
                    logger.warning(
                        f"Failed to delete temp file {temp_file_path}: {cleanup_err}"
                    )


pdf_processing_service = PdfProcessingService()
