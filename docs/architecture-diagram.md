# System Architecture

```mermaid
flowchart LR
    subgraph Client["Browser"]
        UI[Next.js App Router\nTypeScript + Tailwind + shadcn/ui]
    end

    subgraph Backend["Node.js / Express Backend"]
        API[REST API\nControllers → Services → Repositories]
        AUTH[JWT Auth\nAccess + Refresh Tokens]
        PUB[Redis Publisher]
        SUB[Redis Subscriber]
        PG[(PostgreSQL\nvia Prisma ORM)]
    end

    subgraph AI["Python AI Service (FastAPI)"]
        WORKER_PDF[PDF Worker]
        WORKER_CHAT[Chat Worker]
        GRAPH[LangGraph RAG Workflow]
        EMBED[Sentence-Transformers\nEmbeddings]
        LLM[LangChain + OpenAI\nAnswer + Suggestions]
        CHROMA[(ChromaDB\nVector Store)]
    end

    subgraph Broker["Redis"]
        R1[[pdf.process.request]]
        R2[[pdf.process.response]]
        R3[[chat.request]]
        R4[[chat.response]]
        R5[[chat.stream.chunk]]
    end

    UI -- "HTTPS REST + SSE" --> API
    API --> AUTH
    API --> PG
    API --> PUB
    SUB --> API

    PUB -- publish --> R1
    PUB -- publish --> R3
    R1 -- subscribe --> WORKER_PDF
    R3 -- subscribe --> WORKER_CHAT

    WORKER_PDF --> GRAPH
    WORKER_CHAT --> GRAPH
    GRAPH --> EMBED
    GRAPH --> CHROMA
    GRAPH --> LLM

    WORKER_PDF -- publish --> R2
    WORKER_CHAT -- publish --> R4
    WORKER_CHAT -- publish (streamed tokens) --> R5

    R2 -- subscribe --> SUB
    R4 -- subscribe --> SUB
    R5 -- subscribe --> SUB

    style Client fill:#F3F4F1,stroke:#161B2E
    style Backend fill:#EAEBE6,stroke:#161B2E
    style AI fill:#DCEEEA,stroke:#12766A
    style Broker fill:#FCEBC0,stroke:#C6890F
```

**Key design decision:** the Node backend and Python AI service never call each other over
HTTP. All AI processing (PDF ingestion, retrieval, answer generation, suggested questions) is
requested and returned exclusively through Redis Pub/Sub topics, decoupling the two runtimes
and letting either scale or restart independently.
