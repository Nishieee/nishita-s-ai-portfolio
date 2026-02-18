import "dotenv/config";
import express from "express";
import cors from "cors";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";

const {
  PORT = 4000,
  PINECONE_API_KEY,
  PINECONE_INDEX_NAME,
  GROQ_API_KEY,
  HUGGINGFACE_API_TOKEN,
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
if (!HUGGINGFACE_API_TOKEN) {
  console.warn("[RAG] Missing HUGGINGFACE_API_TOKEN (needed for embeddings)");
}

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

// Hugging Face Inference API — same 768-dim model as before, no local model load (faster cold start)
const HF_EMBED_MODEL = "sentence-transformers/all-mpnet-base-v2";
const HF_EMBED_DIMS = 768;

async function embedQuery(text) {
  if (!HUGGINGFACE_API_TOKEN) {
    throw new Error("HUGGINGFACE_API_TOKEN not set — cannot generate embeddings");
  }
  try {
    const res = await fetch(
      `https://router.huggingface.co/pipeline/feature-extraction/${HF_EMBED_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text.slice(0, 8192), // HF limit
          options: { wait_for_model: true },
          normalize: true,
        }),
      }
    );
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`HF API ${res.status}: ${errBody.slice(0, 200)}`);
    }
    const raw = await res.json();
    // API returns 1D array for single string input, or 2D [num_tokens, 768] — normalize to 1D 768
    let vector = Array.isArray(raw) ? raw : null;
    if (!vector || vector.length === 0) {
      throw new Error("Unexpected embedding response: empty or not array");
    }
    if (Array.isArray(vector[0])) {
      // Token-level: mean-pool then L2-normalize
      const dim = vector[0].length;
      const sum = new Array(dim).fill(0);
      for (const row of vector) {
        for (let i = 0; i < dim; i++) sum[i] += row[i];
      }
      const n = vector.length;
      for (let i = 0; i < dim; i++) sum[i] /= n;
      let norm = Math.sqrt(sum.reduce((a, v) => a + v * v, 0)) || 1;
      vector = sum.map((v) => v / norm);
    } else {
      vector = [...vector];
    }
    if (vector.length !== HF_EMBED_DIMS) {
      throw new Error(`Wrong embedding dimension: got ${vector.length}, expected ${HF_EMBED_DIMS}`);
    }
    return vector;
  } catch (error) {
    console.error("[RAG] Embedding error:", error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
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
    embeddingsConfigured: Boolean(HUGGINGFACE_API_TOKEN),
  });
});

// Warmup: no-op when using HF API (no local model). Kept so client can still call it.
app.get("/api/warmup", (_req, res) => {
  res.json({ status: "ok", message: "Using Hugging Face API; no warmup needed" });
});

// Check if embeddings are in Pinecone and get vector count (for debugging)
app.get("/api/rag-status", async (_req, res) => {
  try {
    const health = {
      pineconeConfigured: Boolean(PINECONE_API_KEY && PINECONE_INDEX_NAME),
      groqConfigured: Boolean(GROQ_API_KEY),
      embeddingsConfigured: Boolean(HUGGINGFACE_API_TOKEN),
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

    if (!HUGGINGFACE_API_TOKEN) {
      return res
        .status(500)
        .json({ error: "HUGGINGFACE_API_TOKEN not configured on server" });
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
  console.log(`[RAG] Server listening on http://localhost:${PORT} (embeddings via Hugging Face API)`);
});

