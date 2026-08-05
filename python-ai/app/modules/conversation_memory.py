from typing import List

from app.config.settings import get_settings
from app.schemas.redis_messages import ChatHistoryItem

settings = get_settings()


class ConversationMemory:
    """Formats recent chat history (received from the Node backend, which owns
    persistence in PostgreSQL) into a prompt-friendly string, trimmed to the
    configured number of turns to keep the prompt bounded."""

    def format(self, history: List[ChatHistoryItem]) -> str:
        if not history:
            return "(no previous conversation)"

        trimmed = history[-settings.conversation_memory_turns :]
        lines = []
        for item in trimmed:
            speaker = "User" if item.role == "USER" else "Assistant"
            lines.append(f"{speaker}: {item.content}")
        return "\n".join(lines)


conversation_memory = ConversationMemory()
