import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.services.chat_worker import run_chat_worker
from app.services.pdf_worker import run_pdf_worker
from app.utils.logging import logger

settings = get_settings()

background_tasks: list[asyncio.Task] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Redis pub/sub workers (pdf worker, chat worker)")
    background_tasks.append(asyncio.create_task(run_pdf_worker()))
    background_tasks.append(asyncio.create_task(run_chat_worker()))
    yield
    logger.info("Shutting down background workers")
    for task in background_tasks:
        task.cancel()
    await asyncio.gather(*background_tasks, return_exceptions=True)


app = FastAPI(
    title="PDF Knowledge Base AI Service",
    description="FastAPI + LangChain + LangGraph + ChromaDB RAG microservice, "
    "communicating with the Node backend exclusively via Redis Pub/Sub.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"success": True, "data": {"status": "ok", "service": "python-ai"}}


@app.get("/")
async def root():
    return {
        "service": "PDF Knowledge Base AI Service",
        "communication": "Redis Pub/Sub only (no HTTP calls from backend)",
        "topics": [
            "chat.request",
            "chat.response",
            "chat.stream.chunk",
            "pdf.process.request",
            "pdf.process.response",
        ],
    }
