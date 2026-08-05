from typing import List

from sentence_transformers import SentenceTransformer

from app.config.settings import get_settings
from app.utils.logging import logger

settings = get_settings()


class EmbeddingGenerator:
    """Wraps a sentence-transformers model to generate dense embeddings."""

    def __init__(self) -> None:
        logger.info(f"Loading embedding model: {settings.embedding_model}")
        self.model = SentenceTransformer(settings.embedding_model)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_query(self, text: str) -> List[float]:
        embedding = self.model.encode([text], show_progress_bar=False, convert_to_numpy=True)
        return embedding[0].tolist()


# Loaded once at process start and reused across requests.
embedding_generator = EmbeddingGenerator()
