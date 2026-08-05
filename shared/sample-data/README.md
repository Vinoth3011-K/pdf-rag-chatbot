# Sample Data

`acme-employee-handbook.pdf` is a realistic 2-page sample PDF (generated with ReportLab,
verified extractable with pypdf) used to seed the knowledge base for local development and
demos. It contains sections on working hours, PTO, a refund/cancellation policy, code of
conduct, benefits, and termination — enough structure to exercise retrieval, page-numbered
citations, and multi-turn follow-up questions out of the box.

## How to load it

1. Start the full stack (`docker compose up --build`).
2. Log in to the admin dashboard with the seeded admin credentials (see root `.env.example`).
3. Go to **Knowledge base → Upload PDF** and select
   `shared/sample-data/acme-employee-handbook.pdf`.
4. Wait for its status to move from `PROCESSING` to `READY` (a few seconds locally).
5. Open `/chat` and ask things like:
   - "What is the refund policy?"
   - "How many PTO days do employees get?"
   - "Can I work remotely?"

Answers should come back with citations pointing at page 1 or 2 of the handbook.
