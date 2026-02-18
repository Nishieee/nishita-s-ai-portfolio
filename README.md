# Nishita Matlani — AI Portfolio

Portfolio site with an AI-powered resume chat (RAG): ask questions about experience, skills, and projects.

## Tech

- **Frontend:** Vite, React, TypeScript, Tailwind CSS, shadcn/ui
- **RAG:** Pinecone (vectors), OpenAI / Open Text / Hugging Face (embeddings), Groq (LLM)

## Quick start

```sh
npm i
npm run dev          # Frontend → http://localhost:8080
npm run server       # RAG API → http://localhost:4000 (for /chat)
```

## Environment

Create a `.env` in the project root:

```sh
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=resume-index
GROQ_API_KEY=your-groq-api-key
# Optional — pick one for embeddings:
# OPENAI_API_KEY=sk-...          # OpenAI text-embedding-3-small (1536 dims, ~$0.02/1M tokens)
# HUGGINGFACE_API_TOKEN=hf_...   # Hugging Face (768 dims)
# (If neither set, app uses Open Text Embeddings free tier, 768 dims.)
```

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 8080) |
| `npm run server` | Start RAG backend (port 4000) |
| `npm run build` | Production build |
| `npm run ingest-master-resume` | Embed master resume (Open Text, no key) and upload to Pinecone |
| `npm run delete-all-vectors` | Clear all vectors from Pinecone |
| `npm run setup-pinecone` | Create Pinecone index (768 or 1536 dims; set `PINECONE_INDEX_DIMENSION=1536` for OpenAI) |

## RAG flow

1. User question → embedded via OpenAI / Open Text / HF (or local Xenova in dev) → query Pinecone.
2. Top similar chunks (by cosine similarity) → concatenated as context.
3. Context + question → Groq LLM → answer shown in chat.

## Project layout

- `src/` — React app (pages, components, styles)
- `server/index.mjs` — Express RAG API (embed, Pinecone, Groq)
- `scripts/ingest-master-resume.mjs` — Master resume → chunks → Pinecone
- `scripts/delete-all-vectors.mjs` — Wipe index
- `scripts/setup-pinecone.mjs` — Create index

## Deploy (Netlify + backend)

Netlify hosts **only the frontend**. The RAG API is a Node server and must run elsewhere (e.g. Railway or Render).

### 1. One-time: index and ingest

**If using OpenAI embeddings** (recommended: fast, cheap): create a **1536-dim** index, then ingest:

```sh
# Create index (1536 dims for OpenAI)
PINECONE_INDEX_DIMENSION=1536 npm run setup-pinecone
# Wait a few min for index ready, then ingest (uses OPENAI_API_KEY from .env)
npm run ingest-master-resume
```

**If using free Open Text** (no key): use default 768-dim index:

```sh
npm run setup-pinecone
npm run delete-all-vectors
npm run ingest-master-resume
```

Add `OPENAI_API_KEY=sk-...` to `.env` (and to Render env) to use OpenAI embeddings. Index dimension must match: 1536 for OpenAI, 768 for Open Text / HF.

### 2. Deploy backend (Railway or Render)

- **Railway:** [railway.app](https://railway.app) → New Project → Deploy from GitHub. Start: `npm run server`. Env: `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `GROQ_API_KEY`. (Optional: `HUGGINGFACE_API_TOKEN` for HF embeddings.)
- **Render:** [render.com](https://render.com) → New Web Service → connect repo. **Build:** `npm install`. **Start:** `npm run server`. Add `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `GROQ_API_KEY`. Copy the service URL.

### 3. Deploy frontend to Netlify

- Connect the repo to [Netlify](https://app.netlify.com). Build command and publish directory are in `netlify.toml`.
- In Netlify: **Site settings → Environment variables** add:
  - `VITE_CHAT_API_URL` = your backend URL (e.g. `https://your-app.up.railway.app`) — no trailing slash.
- Redeploy so the build picks up the variable. Chat will call your backend from the live site.
