# LangGraph RAG Workflow

```mermaid
flowchart TD
    START([Receive Question]) --> RETRIEVE[Retrieve Context\nquery ChromaDB via retriever.retrieve]
    RETRIEVE --> ANSWER[Generate Answer\nLangChain + OpenAI, streamed token-by-token\nvia on_token callback -> Redis chat.stream.chunk]
    ANSWER --> SUGGEST[Generate Suggested Questions\n3-5 follow-ups as JSON array]
    SUGGEST --> BUILD[Build Response\nassemble sources: documentId, page, snippet, score]
    BUILD --> END([Return Response\npublished on chat.response])

    style START fill:#161B2E,color:#F3F4F1
    style END fill:#161B2E,color:#F3F4F1
    style RETRIEVE fill:#DCEEEA,stroke:#12766A
    style ANSWER fill:#FCEBC0,stroke:#C6890F
    style SUGGEST fill:#FCEBC0,stroke:#C6890F
    style BUILD fill:#DCEEEA,stroke:#12766A
```

Implemented in `python-ai/app/graph/workflow.py` using `langgraph.graph.StateGraph`, with node
functions in `python-ai/app/graph/nodes.py` and shared state typed in
`python-ai/app/graph/state.py`. Conversation memory (recent turns, owned by the Node backend in
PostgreSQL) is passed into the graph as `history_text` on each invocation so the same graph is
stateless and safely handles concurrent requests from different sessions.
