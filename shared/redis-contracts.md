# Redis Pub/Sub Contracts

These JSON message shapes are the contract between `backend` (Node/Express, publisher of
requests) and `python-ai` (FastAPI, subscriber of requests / publisher of responses).
Both services implement these shapes independently (TypeScript interfaces in
`backend/src/redis/types.ts`, Pydantic models in `python-ai/app/schemas/redis_messages.py`)
since there is no shared runtime package across languages.

## Topic: `pdf.process.request` (Node -> Python)
```json
{
  "requestId": "uuid",
  "documentId": "uuid",
  "fileUrl": "https://api.example.com/uploads/xxxx.pdf",
  "documentTitle": "filename.pdf",
  "chromaCollection": "pdf_knowledge_base"
}
```

## Topic: `pdf.process.response` (Python -> Node)
```json
{
  "requestId": "uuid",
  "documentId": "uuid",
  "status": "READY | FAILED",
  "pageCount": 12,
  "chunkCount": 87,
  "errorMessage": null
}
```

## Topic: `chat.request` (Node -> Python)
```json
{
  "requestId": "uuid",
  "sessionId": "uuid",
  "message": "What is the refund policy?",
  "history": [
    { "role": "USER", "content": "Hi" },
    { "role": "ASSISTANT", "content": "Hello, how can I help?" }
  ]
}
```

## Topic: `chat.stream.chunk` (Python -> Node)
Emitted repeatedly while an answer is being generated (token streaming).
```json
{
  "requestId": "uuid",
  "type": "token",
  "content": "The refund"
}
```

## Topic: `chat.response` (Python -> Node)
Final message once generation + suggested questions are complete.
```json
{
  "requestId": "uuid",
  "sessionId": "uuid",
  "answer": "The refund policy allows returns within 30 days...",
  "sources": [
    { "documentId": "uuid", "documentTitle": "policy.pdf", "pageNumber": 4, "snippet": "...", "score": 0.83 }
  ],
  "suggestedQuestions": [
    "What items are excluded from the refund policy?",
    "How long does a refund take to process?"
  ]
}
```
