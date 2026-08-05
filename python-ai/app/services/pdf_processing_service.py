import os

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

        try:

            logger.info(
                f"[{request.requestId}] Processing PDF: {request.documentId}"
            )


            # Check file exists
            if not os.path.exists(request.filePath):
                raise FileNotFoundError(
                    f"File not found at {request.filePath}"
                )


            # Extract PDF pages
            pages = pdf_loader.load(
                request.filePath
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
                else os.path.basename(request.filePath)
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


pdf_processing_service = PdfProcessingService()