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

## Deploy (Netlify + backend)

Netlify hosts **only the frontend**. The RAG API is a Node server and must run elsewhere (e.g. Railway or Render).

### 1. Deploy backend (Railway or Render)

- **Railway:** [railway.app](https://railway.app) → New Project → Deploy from GitHub. Root directory: project root. Start command: `npm run server`. Add env vars: `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `GROQ_API_KEY`. Copy the public URL (e.g. `https://your-app.up.railway.app`).
- **Render:** [render.com](https://render.com) → New Web Service → connect repo. Build: `npm install`. Start: `node server/index.mjs`. Add same env vars. Copy the service URL.

### 2. Deploy frontend to Netlify

- Connect the repo to [Netlify](https://app.netlify.com). Build command and publish directory are in `netlify.toml`.
- In Netlify: **Site settings → Environment variables** add:
  - `VITE_CHAT_API_URL` = your backend URL (e.g. `https://your-app.up.railway.app`) — no trailing slash.
- Redeploy so the build picks up the variable. Chat will call your backend from the live site.
