from typing import List

import chromadb

from app.utils.logging import logger


class EmbeddingGenerator:
    """Uses ChromaDB's default embedding function."""

    def __init__(self) -> None:
        logger.info("Loading ChromaDB default embedding function")

        self.client = chromadb.PersistentClient()

        self.collection = self.client.get_or_create_collection(
            name="embedding_helper"
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        result = self.collection._embedding_function(texts)
        if hasattr(result, "tolist"):
            return result.tolist()
        if isinstance(result, list):
            return [
                r.tolist() if hasattr(r, "tolist") else r
                for r in result
            ]
        return list(result)

    def embed_query(self, text: str) -> List[float]:
        result = self.collection._embedding_function([text])
        first = result[0]
        if hasattr(first, "tolist"):
            return first.tolist()
        if isinstance(first, list):
            return first
        return list(first)


embedding_generator = EmbeddingGenerator()