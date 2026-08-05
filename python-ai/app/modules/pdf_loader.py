from dataclasses import dataclass
from typing import List

from pypdf import PdfReader

from app.utils.logging import logger


@dataclass
class PageContent:
    page_number: int
    text: str


class PdfLoader:
    """Loads a PDF from disk and extracts text content per page."""

    def load(self, file_path: str) -> List[PageContent]:
        logger.info(f"Loading PDF from {file_path}")
        reader = PdfReader(file_path)
        pages: List[PageContent] = []

        for index, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages.append(PageContent(page_number=index + 1, text=text))

        logger.info(f"Extracted {len(pages)} non-empty pages from {file_path}")
        return pages


pdf_loader = PdfLoader()
