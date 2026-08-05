from typing import Any, Callable, List, Optional, TypedDict

from app.modules.vector_store import RetrievedChunk


class RagState(TypedDict, total=False):
    request_id: str
    session_id: str
    question: str
    history_text: str
    chunks: List[RetrievedChunk]
    answer: str
    suggested_questions: List[str]
    sources: List[dict]
    # Callback invoked with each streamed token as it is generated; wired in
    # by the worker so the graph can push tokens to Redis in real time
    # without the graph itself knowing about Redis.
    on_token: Optional[Callable[[str], Any]]
