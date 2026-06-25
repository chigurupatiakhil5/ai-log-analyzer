# AI Log Analyzer

An AI-powered server log analysis tool. Upload a `.log` or `.txt` file, get an instant spike report for ERROR/WARN/CRITICAL events, and ask plain English questions about your logs — answered in real time by LLaMA 3 via semantic search.

## Features

- **Drag-and-drop upload** — parse and index log files instantly
- **Spike detection** — rule-based ERROR/WARN/CRITICAL frequency analysis, no LLM required
- **Semantic search** — questions are embedded and matched against log chunks via pgvector
- **Streaming answers** — LLaMA 3 (via Groq) streams responses token by token
- **Session isolation** — each upload gets its own UUID, queries only search that session's chunks

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| LLM | LLaMA 3 via Groq API (free tier) |
| Embeddings | sentence-transformers `all-MiniLM-L6-v2` (local) |
| Vector DB | Supabase pgvector |
| Database | PostgreSQL (Supabase) |
| Containers | Docker Compose |
| CI/CD | GitHub Actions |

## Architecture

```
User uploads log file
        │
        ▼
  FastAPI /upload
        │
  ┌─────┴──────┐
  │            │
parse +      spike
chunk        detect
  │
embed (sentence-transformers)
  │
store in Supabase pgvector
        │
User asks a question
        │
        ▼
  FastAPI /query
        │
embed question → pgvector similarity search → top 5 chunks
        │
Groq API (LLaMA 3) streams answer
        │
        ▼
  React ChatBox (streaming UI)
```

## Setup

### Prerequisites
- Python 3.9+
- Node.js 20+
- Docker + Docker Compose
- [Supabase](https://supabase.com) account (free)
- [Groq](https://console.groq.com) API key (free)

### 1. Clone and configure

```bash
git clone https://github.com/chigurupatiakhil5/ai-log-analyzer.git
cd ai-log-analyzer
cp .env.example .env
# Fill in GROQ_API_KEY, SUPABASE_URL, SUPABASE_KEY
```

### 2. Set up Supabase

Run the SQL in `supabase/schema.sql` in your Supabase SQL editor to enable pgvector and create the `log_chunks` table.

### 3. Run with Docker Compose

```bash
docker compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Run without Docker

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install && npm run dev
```

## Project Structure

```
ai-log-analyzer/
├── backend/
│   ├── api/
│   │   ├── upload.py        # POST /upload — parse, embed, store
│   │   └── query.py         # POST /query — semantic search + LLM stream
│   ├── core/
│   │   ├── parser.py        # Log chunking
│   │   ├── embedder.py      # sentence-transformers wrapper
│   │   ├── vector_store.py  # Supabase pgvector read/write
│   │   ├── groq_client.py   # Groq streaming wrapper
│   │   └── spike_detector.py
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── FileUpload.jsx
│       │   ├── SpikeReport.jsx
│       │   └── ChatBox.jsx
│       └── api/client.js
└── docker-compose.yml
```
