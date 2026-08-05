from dataclasses import dataclass
from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config.settings import get_settings
from app.modules.pdf_loader import PageContent
from app.utils.logging import logger

settings = get_settings()


@dataclass
class Chunk:
    chunk_id: str
    text: str
    page_number: int


class TextChunker:
    def __init__(self) -> None:
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def chunk_pages(self, document_id: str, pages: List[PageContent]) -> List[Chunk]:
        chunks: List[Chunk] = []
        running_index = 0

        for page in pages:
            page_chunks = self.splitter.split_text(page.text)
            for text in page_chunks:
                chunk_id = f"{document_id}_p{page.page_number}_c{running_index}"
                chunks.append(Chunk(chunk_id=chunk_id, text=text, page_number=page.page_number))
                running_index += 1

        logger.info(f"Document {document_id} split into {len(chunks)} chunks")
        return chunks


text_chunker = TextChunker()
