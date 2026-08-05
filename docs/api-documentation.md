# API Documentation

Base URL: `http://localhost:4000/api`

All responses follow the shape:
```json
{ "success": true, "data": { ... }, "pagination": { ... } }
```
Errors follow:
```json
{ "success": false, "message": "...", "details": { ... } }
```

## Authentication

### `POST /auth/login`
Body: `{ "email": "admin@example.com", "password": "Admin@12345" }`
Response: `{ accessToken, user }`. Sets an httpOnly `refreshToken` cookie.

### `POST /auth/refresh`
Uses the `refreshToken` cookie (or `{ "refreshToken": "..." }` body as fallback).
Response: `{ accessToken, user }`, rotates the refresh token.

### `POST /auth/logout` 🔒
Revokes the stored refresh token.

### `GET /auth/me` 🔒
Returns the decoded access token payload for the current session.

## Documents (Knowledge Base) 🔒 all routes require `Authorization: Bearer <accessToken>`

### `POST /documents/upload`
`multipart/form-data`, field name `file` (PDF only, ≤25MB by default).
Creates the document record, stores the file, and asynchronously triggers processing over
Redis (`pdf.process.request` → `pdf.process.response`). Returns immediately with
`status: "PENDING"`.

### `GET /documents`
Query params: `search`, `status` (`PENDING|PROCESSING|READY|FAILED`), `page`, `limit`.
Returns a paginated list plus a `pagination` block.

### `GET /documents/:id`
Fetch a single document.

### `DELETE /documents/:id`
Deletes the DB record and removes the file from disk.

### `POST /documents/:id/reprocess`
Re-runs extraction/chunking/embedding for an existing document (e.g. after a failure).

## Chat (public, no auth)

### `POST /chat`
Body: `{ "sessionId"?: string, "message": string }`
Response is **Server-Sent Events** (`Content-Type: text/event-stream`):
- `event: session` → `{ sessionId }` (first event; use this to persist the session id client-side)
- `event: token` → `{ content }` (repeated as the answer streams in)
- `event: done` → `{ answer, sources, suggestedQuestions }` (final event; message is persisted)
- `event: error` → `{ message }` (on failure)

Rate-limited to 20 requests/minute per IP.

### `GET /chat/history/:sessionId`
Returns the full message history for a session, including each message's
`suggestedQuestions` and `sources` (with `documentId`, `pageNumber`, `snippet`, `score`).

## Dashboard 🔒

### `GET /dashboard/stats`
Response:
```json
{
  "totalDocuments": 12,
  "totalChatSessions": 34,
  "totalQuestionsAsked": 87,
  "recentDocuments": [ Document, ... ]
}
```

## Health

### `GET /health`
Unauthenticated liveness check for the backend.

The Python AI service also exposes `GET /health` on port 8000, but it is not part of the
public API surface — the Node backend never calls it over HTTP; all AI work happens over
Redis Pub/Sub as documented in `docs/redis-flow-diagram.md`.
