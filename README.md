# Nishita Matlani — AI Portfolio

Portfolio site with an AI-powered resume chat (RAG): ask questions about experience, skills, and projects.

## Tech

- **Frontend:** Vite, React, TypeScript, Tailwind CSS, shadcn/ui
- **RAG:** Pinecone (vectors), local embeddings (`@xenova/transformers`), Groq (LLM)

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
```

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 8080) |
| `npm run server` | Start RAG backend (port 4000) |
| `npm run build` | Production build |
| `npm run ingest-master-resume` | Embed master resume and upload to Pinecone |
| `npm run delete-all-vectors` | Clear all vectors from Pinecone |
| `npm run setup-pinecone` | Create Pinecone index (768 dims, cosine) |

## RAG flow

1. User question → embedded with local model → query Pinecone.
2. Top similar chunks (by cosine similarity) → concatenated as context.
3. Context + question → Groq LLM → answer shown in chat.

## Project layout

- `src/` — React app (pages, components, styles)
- `server/index.mjs` — Express RAG API (embed, Pinecone, Groq)
- `scripts/ingest-master-resume.mjs` — Master resume → chunks → Pinecone
- `scripts/delete-all-vectors.mjs` — Wipe index
- `scripts/setup-pinecone.mjs` — Create index

## Deploy

Build: `npm run build`. Deploy the `dist/` output and run the RAG server (or a serverless function) with the same env vars. Point the frontend at your RAG API URL via `VITE_CHAT_API_URL` if not same origin.
