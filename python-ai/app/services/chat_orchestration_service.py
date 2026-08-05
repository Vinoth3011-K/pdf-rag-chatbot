from typing import Awaitable, Callable

from app.graph.workflow import rag_graph
from app.modules.conversation_memory import conversation_memory
from app.schemas.redis_messages import ChatRequestMessage, ChatResponseMessage, ChatSourceItem
from app.utils.logging import logger


class ChatOrchestrationService:
    async def handle_chat(
        self, request: ChatRequestMessage, on_token: Callable[[str], Awaitable[None]]
    ) -> ChatResponseMessage:
        logger.info(f"[{request.requestId}] Handling chat request for session {request.sessionId}")

        history_text = conversation_memory.format(request.history)

        initial_state = {
            "request_id": request.requestId,
            "session_id": request.sessionId,
            "question": request.message,
            "history_text": history_text,
            "on_token": on_token,
        }

        final_state = await rag_graph.ainvoke(initial_state)

        sources = [ChatSourceItem(**s) for s in final_state.get("sources", [])]

        return ChatResponseMessage(
            requestId=request.requestId,
            sessionId=request.sessionId,
            answer=final_state.get("answer", ""),
            sources=sources,
            suggestedQuestions=final_state.get("suggested_questions", []),
        )


chat_orchestration_service = ChatOrchestrationService()
