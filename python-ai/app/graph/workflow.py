from langgraph.graph import END, StateGraph

from app.graph.nodes import (
    build_response_node,
    generate_answer_node,
    generate_suggestions_node,
    retrieve_context_node,
)
from app.graph.state import RagState


def build_rag_graph():
    """
    Workflow:

        Receive Question
              |
        Retrieve Context
              |
        Generate Answer
              |
      Generate Suggested Questions
              |
        Return Response
    """
    graph = StateGraph(RagState)

    graph.add_node("retrieve_context", retrieve_context_node)
    graph.add_node("generate_answer", generate_answer_node)
    graph.add_node("generate_suggestions", generate_suggestions_node)
    graph.add_node("build_response", build_response_node)

    graph.set_entry_point("retrieve_context")
    graph.add_edge("retrieve_context", "generate_answer")
    graph.add_edge("generate_answer", "generate_suggestions")
    graph.add_edge("generate_suggestions", "build_response")
    graph.add_edge("build_response", END)

    return graph.compile()


rag_graph = build_rag_graph()
