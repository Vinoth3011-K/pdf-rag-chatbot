# Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ DOCUMENT : uploads
    CHAT_SESSION ||--o{ CHAT_MESSAGE : contains
    CHAT_MESSAGE ||--o{ CHAT_MESSAGE_SOURCE : cites
    DOCUMENT ||--o{ CHAT_MESSAGE_SOURCE : "cited by"

    USER {
        string id PK
        string email UK
        string password_hash
        string name
        string role
        string refresh_token
        datetime created_at
        datetime updated_at
    }

    DOCUMENT {
        string id PK
        string title
        string original_file_name
        string file_path
        int file_size_bytes
        string mime_type
        enum status "PENDING | PROCESSING | READY | FAILED"
        int page_count
        int chunk_count
        string error_message
        string chroma_collection
        string uploaded_by_id FK
        datetime created_at
        datetime updated_at
    }

    CHAT_SESSION {
        string id PK
        string title
        datetime created_at
        datetime updated_at
    }

    CHAT_MESSAGE {
        string id PK
        string session_id FK
        enum role "USER | ASSISTANT"
        text content
        string[] suggested_questions
        datetime created_at
    }

    CHAT_MESSAGE_SOURCE {
        string id PK
        string message_id FK
        string document_id FK
        int page_number
        text snippet
        float score
    }
```

Indexes: `users(email)`, `users(created_at)`, `documents(status)`, `documents(created_at)`,
`documents(updated_at)`, `documents(uploaded_by_id)`, `chat_sessions(created_at)`,
`chat_sessions(updated_at)`, `chat_messages(session_id)`, `chat_messages(created_at)`,
`chat_message_sources(message_id)`, `chat_message_sources(document_id)`.

See `backend/prisma/schema.prisma` for the source of truth and
`backend/prisma/migrations/20250101000000_init/migration.sql` for the generated SQL.
