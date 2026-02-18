import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";
import { pipeline } from "@xenova/transformers";

const {
  PORT = 4000,
  PINECONE_API_KEY,
  PINECONE_INDEX_NAME,
  GROQ_API_KEY,
  HUGGINGFACE_API_TOKEN,
  OPENAI_API_KEY,
} = process.env;

if (!PINECONE_API_KEY) {
  console.warn("[RAG] Missing PINECONE_API_KEY in environment");
}
if (!PINECONE_INDEX_NAME) {
  console.warn("[RAG] Missing PINECONE_INDEX_NAME in environment");
}
if (!GROQ_API_KEY) {
  console.warn("[RAG] Missing GROQ_API_KEY in environment");
}
// In production (e.g. Render): embeddings via API only — no local model (fast cold start).
// Locally: HF API optional; fall back to local Xenova if HF fails or no token.
const IS_PRODUCTION = process.env.RENDER === "true" || process.env.NODE_ENV === "production";

const app = express();
app.use(cors());
app.use(express.json());

let pinecone = null;
if (PINECONE_API_KEY) {
  pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY,
  });
}

const groq = new Groq({
  apiKey: GROQ_API_KEY || "",
});

// Embeddings: OpenAI (1536) when key set; else Open Text / HF / Xenova (768). Index dimension must match.
const EMBED_DIMS_768 = 768;
const EMBED_DIMS_OPENAI = 1536;
const OPEN_TEXT_URL = "https://api.opentextembeddings.com/v1/embeddings";
const OPEN_TEXT_MODEL = "bge-base-en"; // 768 dims
const OPENAI_EMBED_MODEL = "text-embedding-3-small"; // 1536 dims, ~$0.02/1M tokens

const HF_EMBED_MODEL = "sentence-transformers/all-mpnet-base-v2";
const HF_LEGACY_URL = `https://api-inference.huggingface.co/models/${HF_EMBED_MODEL}`;
const HF_ROUTER_URL = `https://router.huggingface.co/hf-inference/models/${HF_EMBED_MODEL}/pipeline/feature-extraction`;

async function embedWithOpenAI(text) {
  const key = OPENAI_API_KEY?.trim();
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: OPENAI_EMBED_MODEL,
        input: text.slice(0, 8192),
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const vector = json?.data?.[0]?.embedding;
    if (!Array.isArray(vector) || vector.length !== EMBED_DIMS_OPENAI) return null;
    return vector;
  } catch {
    return null;
  }
}

async function embedWithOpenText(text) {
  try {
    const res = await fetch(OPEN_TEXT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: text.slice(0, 8192),
        model: OPEN_TEXT_MODEL,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const vector = json?.data?.[0]?.embedding;
    if (!Array.isArray(vector) || vector.length !== EMBED_DIMS_768) return null;
    return vector;
  } catch {
    return null;
  }
}

let localEmbedder = null;
async function getLocalEmbedder() {
  if (IS_PRODUCTION) return null;
  if (!localEmbedder) {
    console.log("[RAG] Loading local embedding model (first time may take 1–2 min)...");
    localEmbedder = await pipeline(
      "feature-extraction",
      "Xenova/all-mpnet-base-v2",
      { quantized: true }
    );
    console.log("[RAG] Local embedding model ready (768 dims).");
  }
  return localEmbedder;
}

async function embedWithLocal(text) {
  const model = await getLocalEmbedder();
  if (!model) return null;
  const output = await model(text, { pooling: "mean", normalize: true });
  const vector = Array.from(output.data);
  if (vector.length !== EMBED_DIMS_768) return null;
  return vector;
}

async function embedWithHFOne(text, url) {
  const token = HUGGINGFACE_API_TOKEN?.trim();
  if (!token) return null;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text.slice(0, 8192),
      options: { wait_for_model: true },
      normalize: true,
    }),
  });
  if (!res.ok) return null;
  const raw = await res.json();
  let vector = Array.isArray(raw) ? raw : null;
  if (!vector || vector.length === 0) return null;
  if (Array.isArray(vector[0])) {
    const dim = vector[0].length;
    const sum = new Array(dim).fill(0);
    for (const row of vector) {
      for (let i = 0; i < dim; i++) sum[i] += row[i];
    }
    const n = vector.length;
    for (let i = 0; i < dim; i++) sum[i] /= n;
    const norm = Math.sqrt(sum.reduce((a, v) => a + v * v, 0)) || 1;
    vector = sum.map((v) => v / norm);
  } else {
    vector = [...vector];
  }
  if (vector.length !== EMBED_DIMS_768) return null;
  return vector;
}

async function embedWithHF(text) {
  let v = await embedWithHFOne(text, HF_LEGACY_URL);
  if (v) return v;
  v = await embedWithHFOne(text, HF_ROUTER_URL);
  return v;
}

async function embedQuery(text) {
  // If OpenAI key is set, use OpenAI first (index must be 1536 dims; re-ingest with OpenAI)
  const fromOpenAI = await embedWithOpenAI(text);
  if (fromOpenAI) return fromOpenAI;

  // Local: prefer Xenova (768) so existing index built with all-mpnet works
  if (!IS_PRODUCTION) {
    const fromLocal = await embedWithLocal(text);
    if (fromLocal) return fromLocal;
    const fromHF = await embedWithHF(text);
    if (fromHF) return fromHF;
    const fromOpenText = await embedWithOpenText(text);
    if (fromOpenText) return fromOpenText;
  } else {
    const fromOpenText = await embedWithOpenText(text);
    if (fromOpenText) return fromOpenText;
    const fromHF = await embedWithHF(text);
    if (fromHF) return fromHF;
  }
  throw new Error(
    "Embeddings failed. Set OPENAI_API_KEY (and use a 1536-dim index), or ensure Pinecone index was ingested with Open Text / HF / Xenova. See README."
  );
}

async function retrieveContext(query, roleFilter = null) {
  if (!pinecone || !PINECONE_INDEX_NAME) {
    return {
      contextText: "",
      matches: [],
    };
  }

  const vector = await embedQuery(query);

  const index = pinecone.index(PINECONE_INDEX_NAME);
  
  const queryOptions = {
    topK: 8,
    vector,
    includeMetadata: true,
  };

  // Skip role filter: master resume vectors use "section"/"company"/"roles", not "role".
  // Filtering by role would return 0 matches and empty context.
  // if (roleFilter) {
  //   queryOptions.filter = { role: { $eq: roleFilter } };
  // }

  // Retry logic for network issues
  let lastError = null;
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await index.query(queryOptions);
      const matches = response.matches || [];
      const contextText = matches
        .map((m) => m.metadata?.text || m.metadata?.content || "")
        .filter(Boolean)
        .join("\n\n");

      return { contextText, matches };
    } catch (error) {
      lastError = error;
      const isNetworkError = error.message?.includes("network") || 
                            error.message?.includes("ECONNREFUSED") ||
                            error.message?.includes("ETIMEDOUT") ||
                            error.message?.includes("ENOTFOUND") ||
                            error.message?.includes("failed to reach Pinecone");
      
      if (isNetworkError && attempt < maxRetries) {
        console.warn(`[RAG] Pinecone query attempt ${attempt} failed (network issue), retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }
      
      // If not a network error or last attempt, throw
      throw error;
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error("Failed to query Pinecone after retries");
}

function detectRoleFromQuery(query) {
  const lowerQuery = query.toLowerCase();
  const roleKeywords = {
    "Data Engineer": ["data engineer", "data engineering", "etl", "pipeline", "data pipeline", "data infrastructure"],
    "Data Analyst": ["data analyst", "data analysis", "analytics", "reporting", "dashboard", "bi"],
    "Business Intelligence Engineer": ["business intelligence", "bie", "bi engineer", "intelligence engineer"],
    "Data Scientist": ["data scientist", "data science", "machine learning", "ml", "model", "prediction", "statistical"],
    "Gen AI Engineer": ["gen ai", "generative ai", "llm", "langchain", "rag", "vector", "embedding", "genai"],
  };

  for (const [role, keywords] of Object.entries(roleKeywords)) {
    if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
      return role;
    }
  }
  return null;
}

async function answerWithGroq({ question, context, roleContext = null }) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const systemPrompt = `You are an AI assistant representing Nishita Matlani's professional profile. You answer questions about her experience, skills, and background using retrieved context from her resume.

## GUARDRAILS (STRICT – MUST FOLLOW)

1. **Output ONLY from resume/vector**: Do not say anything that is not directly supported by the <retrieved_context>. No general knowledge, no explanations of what "data pipelines" or other concepts mean, no generic candidate advice.
2. **When context is empty or does not contain the answer**: Say ONLY that you don't have that information in the resume. Do NOT offer general information, do NOT explain topics, do NOT suggest what a candidate "might" have. Example: "I don't have that information in the resume. You can ask about something listed in her experience, skills, or projects, or reach her at matlaninishi@gmail.com for more details."
3. **Never hallucinate**: If the context does not mention something, do not claim it. If you are unsure, say you don't have that detail.

## Core Rules

1. **Use retrieved context ONLY**: Base all answers strictly on the <retrieved_context> provided. If the answer is not in the context, say you don't have that information in the resume and stop. You may briefly redirect to related info that IS in the context (e.g. "I don't have that specific detail, but her resume does mention [X]. Want to know more about that?").

2. **Treat equivalent terms as the same**: When the user asks about something, match it to what's in the context using common synonyms. For example: "data pipelines" = ETL pipelines, ELT pipelines, batch pipelines, real-time pipelines, data engineering pipelines, data workflows, CDC workflows, data flows. "ML" / "machine learning" = predictive modeling, recommendation systems, etc. If the context mentions ETL pipelines or data engineering pipelines, that IS data pipeline experience—answer from it.

3. **Be concise**: Get straight to the point. Most answers should be 2-4 sentences unless the user asks for details.

4. **Sound human**: Talk like a knowledgeable friend, not a corporate brochure. Use contractions, be natural, skip the fluff.

5. **Include specifics**: Use actual numbers, metrics, company names, and tech from the context - these make you credible.

6. **Invite follow-ups**: End with a simple offer to elaborate if relevant ("Want to know more about that project?" or "Curious about the tech stack?")

## Response Format

<retrieved_context>
[Context will be inserted here]
</retrieved_context>

Read the context, then respond naturally and briefly.

## Example Interactions

**Q: What's Nishita's experience with SQL?**

A: SQL is one of her core strengths - she's used it across all her roles for complex queries, data modeling, and optimization. At EPM Consultancy, she built dimensional data models in Redshift that reduced dashboard query times by ~40%. She works with various databases including Snowflake, BigQuery, PostgreSQL, and Redshift. Want specifics on any of those?

---

**Q: Has she worked with real-time data?**

A: Yep! At DaVinci Corps, she built near real-time pipelines on Azure processing 100K+ daily e-commerce events with a 10-minute SLA. The pipelines delivered analytics-ready datasets for KPI monitoring. She's also worked with Kafka for streaming data.

---

**Q: What's her biggest achievement?**

A: Hard to pick just one, but reducing query resolution time by 22% at Humanitarians AI stands out - she designed resolution time metrics for their medical diagnostic AI workflow and partnered with engineering to optimize it. She also cut manual inventory planning from 2 days to under 6 hours at EPM by automating workflows with Monte Carlo simulations and ABC classification.

---

**Q: Does she know machine learning?**

A: Her background is more focused on data engineering and BI rather than ML modeling. That said, she did validate and A/B test 20K+ LLM interactions at Humanitarians AI, so she has exposure to AI systems. Her sweet spot is building the data infrastructure and pipelines that feed ML models. Want to hear about her data engineering work?

---

**Q: What tools does she use?**

A: She's got a solid toolkit: Python and SQL for core work, PySpark and Airflow for data pipelines, dbt for transformations, and Tableau/Power BI for visualization. On the cloud side, she's worked with AWS (Redshift, S3, Glue), GCP (BigQuery), and Azure. Plus Docker and Kubernetes for containerization. Need details on any specific tool?

---

**Q: Where did she work?**

A: Three main places: 

- **Humanitarians AI** (Boston, early 2025) - Data Engineer working on healthcare AI analytics
- **EPM Consultancy** (Mumbai, 2022-2023) - BI Engineer on e-commerce and supply chain projects  
- **DaVinci Corps** (Mumbai, 2020) - BI Engineer building real-time pipelines

She's currently finishing her Master's at Northeastern and looking for full-time roles.

---

**Q: What kind of job is she looking for?**

A: She's targeting Business Intelligence Engineer, Data Engineer, and Data Analytics roles. She wants to work on challenging data problems at scale, ideally combining data engineering with analytics or AI. Open to various industries - she's already worked in healthcare, e-commerce, and supply chain.

---

**Q: Tell me about her education**

A: She's completing her MS in Information Systems at Northeastern University (graduating December 2025). She's also been a Teaching Assistant for their Human-Centered AI course, supporting 150+ students on Responsible AI topics.

---

## Tone Guidelines

✅ **Do this:**
- "Yep, she's worked with that"
- "That's one of her strong areas"
- "Not specifically, but she has experience with..."
- "She cut that process from 2 days to 6 hours"
- Natural, conversational language

❌ **Don't do this:**
- "I am pleased to inform you that..."
- "She possesses extensive experience in..."
- "Her skill set encompasses..."
- "It would be prudent to note that..."
- Corporate jargon or overly formal language

## When Context is Missing or Does Not Contain the Answer

Do NOT provide general information or explain concepts. Say ONLY something like:

"I don't have that information in the resume. You can ask about her experience, skills, or projects as listed in her resume, or reach her at matlaninishi@gmail.com for more details."

Optionally, if the context has related info, you may add: "Her resume does mention [related topic]. Want to know more about that?"

## Contact Info (only share when asked)

- Email: matlaninishi@gmail.com
- Phone: (857) 999-5526  
- LinkedIn, GitHub, Portfolio available on her website${roleContext ? `

**Note**: The user is asking from the perspective of a ${roleContext} role. Keep the same conversational tone while highlighting experience and skills most relevant to this role.` : ""}`;

  const userPrompt = `<retrieved_context>
${context || "(no context found)"}
</retrieved_context>

**Question:** ${question}

Answer naturally and concisely based on the retrieved context above.`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    model: "llama-3.3-70b-versatile", // Updated: llama-3.1-70b-versatile was decommissioned
    temperature: 0.7,
    max_tokens: 1000,
  });

  return completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
}

app.get("/", (_req, res) => {
  res.json({
    message: "RAG API for Nishita Matlani portfolio chat",
    endpoints: {
      health: "GET /health",
      ragStatus: "GET /api/rag-status",
      chat: "POST /api/chat",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    pineconeConfigured: Boolean(PINECONE_API_KEY && PINECONE_INDEX_NAME),
    groqConfigured: Boolean(GROQ_API_KEY),
    embeddingsConfigured: true,
  });
});

// Warmup: in local dev preloads Xenova; in production no-op (embeddings via API only)
app.get("/api/warmup", async (_req, res) => {
  if (IS_PRODUCTION) {
    return res.json({ status: "ok", message: "Production: embeddings via API" });
  }
  try {
    await getLocalEmbedder();
    res.json({ status: "ok", message: "Embedding model ready" });
  } catch (err) {
    console.error("[/api/warmup]", err);
    res.status(500).json({ status: "error", error: err?.message });
  }
});

// Check if embeddings are in Pinecone and get vector count (for debugging)
app.get("/api/rag-status", async (_req, res) => {
  try {
    const health = {
      pineconeConfigured: Boolean(PINECONE_API_KEY && PINECONE_INDEX_NAME),
      groqConfigured: Boolean(GROQ_API_KEY),
      embeddingsConfigured: true,
      vectorCount: null,
      indexDimension: null,
      error: null,
    };
    if (!pinecone || !PINECONE_INDEX_NAME) {
      return res.json(health);
    }
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const stats = await index.describeIndexStats();
    health.vectorCount = stats.totalRecordCount ?? stats.totalVectorCount ?? null;
    health.indexDimension = stats.dimension ?? null;
    res.json(health);
  } catch (err) {
    console.error("[/api/rag-status] Error:", err);
    res.status(500).json({
      pineconeConfigured: Boolean(PINECONE_API_KEY && PINECONE_INDEX_NAME),
      groqConfigured: Boolean(GROQ_API_KEY),
      vectorCount: null,
      error: err?.message || String(err),
    });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, role } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' in request body" });
    }

    if (!GROQ_API_KEY) {
      return res
        .status(500)
        .json({ error: "GROQ_API_KEY not configured on server" });
    }

    console.log("[RAG] Query:", message.slice(0, 80) + (message.length > 80 ? "..." : ""));

    const detectedRole = role || detectRoleFromQuery(message);
    if (detectedRole) console.log("[RAG] Detected role:", detectedRole);

    // Step 1: Embed query and run similarity search in Pinecone
    const { contextText, matches } = await retrieveContext(message, detectedRole);
    console.log("[RAG] Pinecone similarity: matches =", matches.length, "| context length =", contextText.length, "chars");
    if (matches.length === 0) {
      console.warn("[RAG] No vectors found in index — run 'npm run ingest-resumes' to populate.");
    }

    // Guardrail: if no context was retrieved, do not call LLM — return fixed message
    const noContextMessage =
      "I don't have that information in the resume. You can ask about her experience, skills, or projects as listed in her resume, or reach her at matlaninishi@gmail.com for more details.";
    if (!contextText || contextText.trim().length === 0 || matches.length === 0) {
      console.log("[RAG] No context retrieved — returning guardrail message (no LLM call)");
      return res.json({
        answer: noContextMessage,
        detectedRole: detectedRole || null,
        sources: [],
      });
    }

    // Step 2: Generate answer with Groq using retrieved context
    const answer = await answerWithGroq({
      question: message,
      context: contextText,
      roleContext: detectedRole,
    });
    console.log("[RAG] Groq response OK, length =", answer?.length ?? 0, "chars");

    res.json({
      answer,
      detectedRole,
      sources: matches.map((m) => ({
        id: m.id,
        score: m.score,
        metadata: m.metadata,
      })),
    });
  } catch (err) {
    console.error("[/api/chat] Error:", err);
    res.status(500).json({
      error: "Failed to generate answer",
      details: err?.message || String(err),
    });
  }
});

app.listen(PORT, () => {
  console.log(
    IS_PRODUCTION
      ? `[RAG] Server listening on http://localhost:${PORT} (production: embeddings via HF API only)`
      : `[RAG] Server listening on http://localhost:${PORT} (local: HF API or Xenova fallback)`
  );
  if (!IS_PRODUCTION) {
    setImmediate(() => {
      getLocalEmbedder()
        .then(() => console.log("[RAG] Preload: local embedding model ready"))
        .catch((e) => console.error("[RAG] Preload:", e.message));
    });
  }
});

