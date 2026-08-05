# Marginal — AI PDF Knowledge Base Chatbot

A production-structured RAG (Retrieval-Augmented Generation) chatbot that answers questions
from a library of uploaded PDFs, with streamed answers, page-numbered citations, and
AI-generated follow-up questions. Built as three independently-deployable services that
communicate over **Redis Pub/Sub only** — the Node backend and Python AI service never call
each other over HTTP.

## Stack

| Layer        | Technology                                                                                                          |
|--------------|---------------------------------------------------------------------------------------------------------------------|
| Frontend     | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui-style components, React Hook Form, Zod, TanStack Query |
| Backend      | Node.js, Express, TypeScript, Prisma ORM, JWT auth, Multer, Redis Pub/Sub                                           |
| AI Service   | Python, FastAPI, LangChain, LangGraph, ChromaDB, Sentence-Transformers, pypdf                                       |
| Database     | PostgreSQL                                                                                                          |
| Vector Store | ChromaDB (persistent, local disk)                                                                                   |
| Messaging    | Redis Pub/Sub (no HTTP between backend and AI service)                                                              |

## Project structure

```
project-root/
├── frontend/          Next.js app (admin dashboard + public chat)
├── backend/           Express API (auth, documents, chat, dashboard) + Redis pub/sub client
├── python-ai/         FastAPI service: PDF ingestion + LangGraph RAG pipeline, Redis workers
├── shared/            Cross-service contracts (redis-contracts.md) + sample PDF for seeding
├── docs/              Architecture / ER / Redis-flow / LangGraph diagrams + API docs
├── docker-compose.yml Orchestrates postgres, redis, backend, python-ai, frontend
└── .env.example       All environment variables for every service, in one place
```

## How the pieces talk to each other

```
Browser ⇄ Next.js ⇄ (REST + SSE) ⇄ Express backend ⇄ (Redis Pub/Sub) ⇄ FastAPI AI service ⇄ ChromaDB
                                          ⇅
                                     PostgreSQL
```

- The backend publishes `pdf.process.request` / `chat.request` and subscribes to
  `pdf.process.response` / `chat.response` / `chat.stream.chunk`.
- The Python service subscribes to the `*.request` topics and publishes the `*.response` /
  `chat.stream.chunk` topics.
- Full message contracts: [`shared/redis-contracts.md`](./shared/redis-contracts.md).
- Diagrams: [`docs/architecture-diagram.md`](./docs/architecture-diagram.md) ·
  [`docs/er-diagram.md`](./docs/er-diagram.md) ·
  [`docs/redis-flow-diagram.md`](./docs/redis-flow-diagram.md) ·
  [`docs/langgraph-diagram.md`](./docs/langgraph-diagram.md)

## Features

- **Auth**: admin login, JWT access + refresh tokens (httpOnly cookie), protected routes,
  bcrypt password hashing, logout that revokes the refresh token.
- **Admin dashboard**: total PDFs, total chat sessions, total questions asked, recently
  uploaded documents.
- **Knowledge base management**: upload PDF (drag-and-drop), list with search + pagination,
  delete, reprocess (re-run extraction/chunking/embedding on an existing file).
- **Upload pipeline**: store original PDF → extract text (pypdf) → chunk (LangChain recursive
  splitter) → embed (sentence-transformers) → upsert into ChromaDB → persist metadata in
  PostgreSQL via Prisma.
- **Public chat** (no login required): streamed responses over SSE, Markdown rendering, typing
  indicator, conversation memory (recent turns passed into the prompt), 3–5 AI-generated
  suggested follow-up questions, source document + page number citations, responsive UI.
- **LangGraph pipeline**: Receive Question → Retrieve Context → Generate Answer → Generate
  Suggested Questions → Return Response (see `python-ai/app/graph/`).
- **Clean architecture**: Repository Pattern (`backend/src/repositories`), service layer
  (`backend/src/services`), central error handler, Zod validation, structured logging
  (winston / loguru), strict TypeScript.

## API reference

Base URL: `http://localhost:4000/api` — 🔒 = requires `Authorization: Bearer <accessToken>`

| Method | Endpoint                    | Auth | Description                                                    |
|--------|-----------------------------|------|----------------------------------------------------------------|
| GET    | `/health`                   |      | Liveness check                                                 |
| POST   | `/auth/login`               |      | Email + password → `{ accessToken, user }`, sets refresh cookie |
| POST   | `/auth/refresh`             |      | Rotate refresh token → new `accessToken`                       |
| POST   | `/auth/logout`              | 🔒   | Revoke stored refresh token                                    |
| GET    | `/auth/me`                  | 🔒   | Current user from access token                                 |
| POST   | `/documents/upload`         | 🔒   | `multipart/form-data` field `file` (PDF ≤ 25 MB); returns `PENDING` |
| GET    | `/documents`                | 🔒   | List with `search`, `status`, `page`, `limit` query params     |
| GET    | `/documents/:id`            | 🔒   | Single document                                                |
| DELETE | `/documents/:id`            | 🔒   | Delete record + file from disk                                 |
| POST   | `/documents/:id/reprocess`  | 🔒   | Re-run extraction / chunking / embedding                       |
| POST   | `/chat`                     |      | SSE stream — see below (rate-limited: 20 req/min per IP)       |
| GET    | `/chat/history/:sessionId`  |      | Full message history with sources + suggested questions        |
| GET    | `/dashboard/stats`          | 🔒   | `{ totalDocuments, totalChatSessions, totalQuestionsAsked, recentDocuments }` |

### `POST /chat` — SSE event sequence

```
event: session  →  { sessionId }                          # always first; persist this client-side
event: token    →  { content }                            # repeated as answer streams in
event: done     →  { answer, sources, suggestedQuestions }# final; message saved to DB
event: error    →  { message }                            # on failure
```

Body: `{ "sessionId"?: string, "message": string }`

Full details: [`docs/api-documentation.md`](./docs/api-documentation.md)

## Running locally with Docker (recommended)

```bash
cp .env.example .env
# edit .env — set GROQ_API_KEY, change JWT secrets and admin password

docker compose up --build
```

- Frontend:   http://localhost:3000
- Backend API: http://localhost:4000/api
- AI service:  http://localhost:8000 (health check only; not part of the public API)
- Postgres: localhost:5432 · Redis: localhost:6379

The backend container runs `prisma migrate deploy` automatically on startup. To seed the
admin user, run once:

```bash
docker compose exec backend npm run prisma:seed
```

Default admin credentials (change in `.env` before deploying):
```
email:    admin@example.com
password: Admin@12345
```

Then log in at `/login`, upload `shared/sample-data/acme-employee-handbook.pdf` from the
Knowledge Base page, and try the public chat at `/chat` — see
[`shared/sample-data/README.md`](./shared/sample-data/README.md) for example questions.

## Running each service without Docker

### PostgreSQL & Redis
```bash
docker compose up -d postgres redis
```

### Backend
```bash
cd backend
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev        # http://localhost:4000
```

### Python AI service
```bash
cd python-ai
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

## Environment variables

One `.env.example` at the repo root covers all three services. Copy it to `.env` and fill in
the required values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `JWT_ACCESS_SECRET` | ✅ | Sign access tokens — change before deploying |
| `JWT_REFRESH_SECRET` | ✅ | Sign refresh tokens — change before deploying |
| `GROQ_API_KEY` | ✅ | Groq API key (get one free at console.groq.com) |
| `GROQ_MODEL` | | Default: `llama-3.3-70b-versatile` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | | Seed credentials for the admin user |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | | Only needed if switching `LLM_PROVIDER=openai` |

Each service also has its own `.env.example` for standalone (non-Docker) runs:
`backend/.env.example`, `python-ai/.env.example`, `frontend/.env.example`.

> For Docker runs, `DATABASE_URL` and `REDIS_URL` should use the container hostnames
> (`postgres`, `redis`). For local runs, use `localhost`.

## AI provider

The answer generator (`python-ai/app/modules/answer_generator.py`) defaults to
**Groq** (`LLM_PROVIDER=groq`). Set `GROQ_API_KEY` and optionally `GROQ_MODEL` in `.env`.

To switch to OpenAI, set `LLM_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_MODEL` in
`.env`. Only that one file changes — the LangGraph workflow, prompts, and Redis contracts are
provider-agnostic.
