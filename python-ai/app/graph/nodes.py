from app.graph.state import RagState
from app.modules.answer_generator import answer_generator
from app.modules.retriever import retriever
from app.utils.logging import logger


async def retrieve_context_node(state: RagState) -> RagState:
    logger.info(
        f"[{state['request_id']}] Retrieving context for: {state['question'][:80]}"
    )

    chunks = retriever.retrieve(
        state["question"]
    )

    return {
        **state,
        "chunks": chunks
    }



async def generate_answer_node(state: RagState) -> RagState:

    logger.info(
        f"[{state['request_id']}] Generating answer"
    )

    on_token = state.get("on_token")

    full_answer = ""


    async for token in answer_generator.stream_answer(
        state["question"],
        state["history_text"],
        state.get("chunks", [])
    ):

        full_answer += token

        if on_token:
            await on_token(token)


    return {
        **state,
        "answer": full_answer
    }




async def generate_suggestions_node(state: RagState) -> RagState:

    logger.info(
        f"[{state['request_id']}] Generating suggested questions"
    )


    suggestions = await answer_generator.generate_suggested_questions(
        state["question"],
        state["answer"],
        state["history_text"],
        state.get("chunks", [])
    )


    return {
        **state,
        "suggested_questions": suggestions
    }





async def build_response_node(state: RagState) -> RagState:

    chunks = state.get(
        "chunks",
        []
    )


    sources = []

    seen = set()



    for c in chunks:


        # Ignore low relevance sources
        if c.get("score", 0) < 0.5:
            continue



        key = (
            c["document_id"],
            c.get("page_number")
        )



        # Remove duplicate pages
        if key in seen:
            continue



        seen.add(key)



        sources.append(
            {
                "documentId": c["document_id"],

                "documentTitle": c.get(
                    "document_title",
                    "Unknown"
                ),

                "pageNumber": c.get(
                    "page_number"
                ),

                "snippet": c.get(
                    "text",
                    ""
                )[:280],

                "score": c.get(
                    "score",
                    0
                ),
            }
        )



    return {
        **state,
        "sources": sources
    }