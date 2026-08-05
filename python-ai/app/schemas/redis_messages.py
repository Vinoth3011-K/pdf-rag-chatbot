from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# ==============================
# PDF Processing Messages
# ==============================

class PdfProcessRequestMessage(BaseModel):
    requestId: str
    documentId: str
    filePath: str
    chromaCollection: str

    # Original uploaded PDF name
    # Example: NLP RECORD 01.pdf
    documentTitle: Optional[str] = None



class PdfProcessResponseMessage(BaseModel):
    requestId: str
    documentId: str
    status: Literal["READY", "FAILED"]

    pageCount: Optional[int] = None
    chunkCount: Optional[int] = None
    errorMessage: Optional[str] = None



# ==============================
# Chat Messages
# ==============================

class ChatHistoryItem(BaseModel):
    role: Literal["USER", "ASSISTANT"]
    content: str



class ChatRequestMessage(BaseModel):
    requestId: str
    sessionId: str
    message: str

    history: List[ChatHistoryItem] = Field(
        default_factory=list
    )



class ChatStreamChunkMessage(BaseModel):
    requestId: str

    type: Literal[
        "token",
        "done",
        "error"
    ]

    content: str



# ==============================
# Source Metadata
# ==============================

class ChatSourceItem(BaseModel):
    documentId: str
    documentTitle: str

    pageNumber: Optional[int] = None
    snippet: Optional[str] = None
    score: Optional[float] = None



# ==============================
# Final Chat Response
# ==============================

class ChatResponseMessage(BaseModel):
    requestId: str
    sessionId: str

    answer: str

    sources: List[ChatSourceItem] = Field(
        default_factory=list
    )

    suggestedQuestions: List[str] = Field(
        default_factory=list
    )