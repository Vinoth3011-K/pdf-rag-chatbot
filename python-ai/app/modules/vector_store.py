from typing import List, Optional, TypedDict

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config.settings import get_settings
from app.modules.chunking import Chunk
from app.modules.embeddings import embedding_generator
from app.utils.logging import logger


settings = get_settings()


class RetrievedChunk(TypedDict):
    text: str
    document_id: str
    document_title: str
    page_number: Optional[int]
    score: float


class VectorStore:

    def __init__(self) -> None:

        self.client = chromadb.PersistentClient(
            path=settings.chroma_db_path,
            settings=ChromaSettings(
                anonymized_telemetry=False
            ),
        )

        self.collection = self.client.get_or_create_collection(
            name=settings.chroma_collection_name,
            metadata={
                "hnsw:space": "cosine"
            },
        )


    def upsert_chunks(
        self,
        document_id: str,
        document_title: str,
        chunks: List[Chunk],
    ) -> None:

        if not chunks:
            return

        texts = [
            c.text for c in chunks
        ]

        embeddings = embedding_generator.embed_documents(
            texts
        )

        ids = [
            c.chunk_id for c in chunks
        ]

        metadatas = [
            {
                "document_id": document_id,
                "document_title": document_title,
                "page_number": c.page_number,
            }
            for c in chunks
        ]

        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        logger.info(
            f"Upserted {len(chunks)} chunks into Chroma for document {document_id}"
        )


    def delete_document(
        self,
        document_id: str
    ) -> None:

        self.collection.delete(
            where={
                "document_id": document_id
            }
        )

        logger.info(
            f"Deleted vectors for document {document_id} from Chroma"
        )


    def query(
        self,
        query_text: str,
        top_k: int
    ) -> List[RetrievedChunk]:

        query_embedding = embedding_generator.embed_query(
            query_text
        )

        results = self.collection.query(
            query_embeddings=[
                query_embedding
            ],
            n_results=top_k,
            include=[
                "documents",
                "metadatas",
                "distances",
            ],
        )


        retrieved: List[RetrievedChunk] = []


        documents = results.get(
            "documents",
            [[]]
        )[0]

        metadatas = results.get(
            "metadatas",
            [[]]
        )[0]

        distances = results.get(
            "distances",
            [[]]
        )[0]


        for text, meta, distance in zip(
            documents,
            metadatas,
            distances
        ):

            similarity = 1 - distance


            # Ignore unrelated chunks
            if similarity < 0.20:
                continue


            retrieved.append(
                RetrievedChunk(
                    text=text,

                    document_id=meta.get(
                        "document_id",
                        ""
                    ),

                    document_title=meta.get(
                        "document_title",
                        "Unknown"
                    ),

                    page_number=meta.get(
                        "page_number"
                    ),

                    score=round(
                        float(similarity),
                        4
                    ),
                )
            )


        return retrieved


vector_store = VectorStore()