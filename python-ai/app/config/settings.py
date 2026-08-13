from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    # Service
    ai_service_port: int = 8000
    node_env: str = "development"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Chroma
    chroma_db_path: str = "./chroma_data"
    chroma_collection_name: str = "pdf_knowledge_base"

    # Embeddings
    embedding_model: str = ""

    # LLM (Groq)
    llm_provider: str = "groq"

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Chunking
    chunk_size: int = 1000
    chunk_overlap: int = 150

    # Retrieval
    retrieval_top_k: int = 8

    # Conversation Memory
    conversation_memory_turns: int = 6


@lru_cache
def get_settings() -> Settings:
    return Settings()