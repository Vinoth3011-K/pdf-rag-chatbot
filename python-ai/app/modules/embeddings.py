from typing import List

import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

from app.utils.logging import logger


class EmbeddingGenerator:
    """Generate embeddings using ChromaDB's default embedding function."""

    def __init__(self) -> None:
        logger.info("Loading ChromaDB default embedding function")

        self.embedding_function = DefaultEmbeddingFunction()

    def embed_documents(
        self,
        texts: List[str]
    ) -> List[List[float]]:

        return self.embedding_function(texts)

    def embed_query(
        self,
        text: str
    ) -> List[float]:

        embeddings = self.embedding_function([text])
        return embeddings[0]


embedding_generator = EmbeddingGenerator()