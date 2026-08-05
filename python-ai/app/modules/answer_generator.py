import json
from typing import AsyncIterator, List

from langchain_groq import ChatGroq

from app.config.settings import get_settings
from app.modules.prompts import answer_prompt, suggested_questions_prompt
from app.modules.vector_store import RetrievedChunk
from app.utils.logging import logger


settings = get_settings()


def _build_context(chunks: List[RetrievedChunk]) -> str:
    if not chunks:
        return "(no relevant context found in the knowledge base)"

    parts = []

    for i, c in enumerate(chunks, start=1):
        page_info = f", page {c['page_number']}" if c.get("page_number") else ""

        parts.append(
            f"[Source {i}: {c['document_title']}{page_info}]\n{c['text']}"
        )

    return "\n\n".join(parts)


class AnswerGenerator:

    def __init__(self) -> None:

        if not settings.groq_api_key:
            raise ValueError(
                "GROQ_API_KEY is missing. Please add it in .env file."
            )

        # AI Answer Generator
        self.llm = ChatGroq(
            model=settings.groq_model,
            api_key=settings.groq_api_key,
            temperature=0.2,
            streaming=True,
        )


        # Follow-up Question Generator
        self.suggestion_llm = ChatGroq(
            model=settings.groq_model,
            api_key=settings.groq_api_key,
            temperature=0.5,
        )


    async def stream_answer(
        self,
        question: str,
        history_text: str,
        chunks: List[RetrievedChunk]
    ) -> AsyncIterator[str]:

        context = _build_context(chunks)

        chain = answer_prompt | self.llm


        async for event in chain.astream(
            {
                "history": history_text,
                "context": context,
                "question": question,
            }
        ):

            if event.content:
                yield str(event.content)



    async def generate_answer(
        self,
        question: str,
        history_text: str,
        chunks: List[RetrievedChunk]
    ) -> str:

        full_answer = ""

        async for token in self.stream_answer(
            question,
            history_text,
            chunks
        ):
            full_answer += token


        return full_answer



    async def generate_suggested_questions(
        self,
        question: str,
        answer: str,
        history_text: str,
        chunks: List[RetrievedChunk]
    ) -> List[str]:


        context = _build_context(chunks)

        chain = suggested_questions_prompt | self.suggestion_llm


        try:

            result = await chain.ainvoke(
                {
                    "history": history_text,
                    "question": question,
                    "answer": answer,
                    "context": context,
                }
            )


            raw = result.content.strip()


            # Remove markdown json formatting
            if raw.startswith("```json"):
                raw = raw.replace("```json", "")

            if raw.endswith("```"):
                raw = raw.replace("```", "")


            raw = raw.strip()


            questions = json.loads(raw)


            if isinstance(questions, list):
                return [
                    str(question)
                    for question in questions[:5]
                ]


            return []


        except Exception as exc:

            logger.warning(
                f"Failed to generate suggested questions: {exc}"
            )

            return []



answer_generator = AnswerGenerator()