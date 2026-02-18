import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";

const { PINECONE_API_KEY, PINECONE_INDEX_NAME, HUGGINGFACE_API_TOKEN, OPENAI_API_KEY } = process.env;

if (!PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
  console.error("❌ Missing required environment variables:");
  console.error("   PINECONE_API_KEY, PINECONE_INDEX_NAME");
  process.exit(1);
}
// Embeddings: Open Text (free, no key) or HF if token set. Use same for ingest and server.

// Master Resume Data
const masterResume = {
  contact: {
    phone: "(857) 999-5526",
    email: "matlaninishi@gmail.com",
    linkedin: "https://www.linkedin.com/in/nishitamatlani",
    github: "https://github.com/nishieee"
  },
  education: {
    school: "Northeastern University",
    location: "Boston, MA",
    degree: "Master of Science, Information Systems",
    graduation: "December 2025",
    note: "Teaching Assistant, Human-Centered AI: Supported 120+ students in understanding Responsible AI"
  },
  technicalSkills: {
    languages: ["Python", "SQL", "R", "Java", "JavaScript"],
    databases: ["Snowflake", "BigQuery", "Amazon RedShift", "PostgreSQL", "MS SQL Server", "MySQL", "MongoDB", "Oracle DB", "Neo4j", "Pinecone", "Chroma DB", "FAISS"],
    frameworks: {
      dataProcessing: ["NumPy", "pandas", "Seaborn", "Matplotlib", "PySpark", "Hadoop", "Hive", "Spark"],
      mlAI: ["scikit-learn", "PyTorch", "TensorFlow", "Hugging Face"],
      genAI: ["LangChain", "LangGraph", "LlamaIndex", "RAG"],
      workflow: ["Airflow", "Kafka", "Iceberg"]
    },
    platforms: {
      cloud: ["AWS (S3, EMR, RedShift, Lambda, Step Functions)", "Azure (Synapse, Data Factory, streaming pipelines)", "GCP (BigQuery, Vertex AI)", "Amazon Bedrock"],
      dataEngineering: ["dbt", "Databricks", "Alteryx", "Talend", "Docker", "Kubernetes", "Terraform"],
      biVisualization: ["Tableau", "Power BI (DAX)", "QuickSight", "Advanced Excel"],
      devops: ["Prometheus", "Git/GitHub", "CI/CD pipelines"],
      featureStore: ["Feast"]
    },
    coreCompetencies: {
      dataEngineering: ["ETL/ELT pipelines", "dimensional modeling (Kimball)", "data warehousing", "schema design", "data governance", "CDC workflows", "incremental loading", "SCD2"],
      dataScience: ["EDA", "statistical analysis", "regression", "classification", "time-series analysis", "cohort analysis", "churn prediction", "feature engineering", "predictive modeling"],
      machineLearning: ["Supervised/unsupervised learning", "recommendation systems (ALS-based)", "anomaly detection (Isolation Forest)"],
      genAI: ["Agentic AI", "RAG", "LLM evaluation", "prompt engineering", "A/B testing for models", "vector databases", "embedding models (MiniLM)", "HIPAA-compliant workflows"],
      analytics: ["KPI definition and dashboarding", "A/B testing", "experimentation frameworks", "conversion analysis", "pricing response analysis", "campaign optimization"],
      businessIntelligence: ["Ad-hoc analysis", "automated reporting", "data quality validation", "measurement frameworks", "business case development"]
    }
  },
  experience: [
    {
      company: "Humanitarians AI",
      location: "Boston, MA",
      roles: ["GenAI Engineer", "AI Engineer", "Data Engineer", "Software Engineer – Data"],
      period: "Jan 2025 – Apr 2025",
      sections: {
        platformInfrastructure: [
          "Led a team of 3 in the implementation of an end-to-end agentic AI healthcare platform using LangChain and MCP (Model Context Protocol), enabling dynamic agent interactions with agent state stored and retrieved from a vector database (RAG)",
          "Designed and built a scalable data platform on AWS supporting agent-driven healthcare applications, designing reliable data flows to store, retrieve, and manage state across downstream systems",
          "Integrated backend APIs (FastAPI) and a React-based interface to support human-in-the-loop review and iteration, enabling seamless interaction between agent workflows, evaluation outputs, and internal user feedback"
        ],
        dataEngineeringCompliance: [
          "Built HIPAA-compliant data pipelines processing 300K+ synthetic clinical personas for testing and fine-tuning MiniLM-based embedding models, reducing token usage and improving retrieval performance for vector-based agent memory",
          "Prepared, validated, and documented datasets ensuring data quality and traceability through schema validation and field-level controls to support compliant reporting"
        ],
        aiMlEvaluationOptimization: [
          "Developed automated LLM evaluation pipeline analyzing 8,000+ interactions to track hallucination rates, latency, and cost trade-offs, reducing operational costs by 35% while maintaining production-grade response quality",
          "Designed and deployed automated evaluation pipelines to production using Python-based quality metrics (accuracy, relevance, consistency), enabling data-driven model comparison",
          "Evaluated multi-model GenAI orchestration across OpenAI, Amazon Bedrock, Vertex AI, and Cohere using prompt engineering and A/B testing to identify optimal models based on accuracy, latency, and response quality",
          "Built human-in-the-loop review workflows and A/B testing infrastructure to compare model outputs, identifying optimal configurations based on accuracy and response quality",
          "Performed functional validation and A/B testing across 20K+ LLM interactions, standardizing test parameters to assess output quality and identify optimal system configurations"
        ],
        monitoringAnalytics: [
          "Built analytics workflows for healthcare systems to track retrieval accuracy and response quality across 1K+ AI agents, helping teams diagnose system behavior and improve medical query resolution time by 22%",
          "Designed structured output validation and A/B comparison frameworks for multi-agent systems, enforcing schema consistency across multiple LLM platforms and logging 10k+ interactions to inform model selection"
        ]
      }
    },
    {
      company: "EPM Consultancy",
      location: "Mumbai, IN",
      roles: ["Product Data Scientist", "Data Scientist", "Data Engineer", "Business Intelligence Engineer", "Business Analyst"],
      period: "Feb 2022 – Jun 2023",
      projects: [
        {
          name: "eCommerce Platform – Growth & Analytics",
          sections: {
            dataScienceAnalytics: [
              "Performed exploratory data analysis (EDA) on large-scale transaction data (~1M rows weekly) to identify customer behavior patterns, conversion drivers, and response to pricing changes, translating insights into actionable recommendations",
              "Collaborated with product and growth teams to define campaign hypotheses and success metrics (KPIs), applying statistical analysis and predictive models (logistic regression, decision trees) to support customer targeting and campaign optimization",
              "Built cohort-based and pre/post analysis frameworks in Python to measure conversion lift, behavioral impact, and post-launch performance using seasonality-adjusted time-series analysis",
              "Developed cohort-based analysis frameworks in Python (pandas, scipy) to measure conversion lift and behavioral impact, incorporating time-series decomposition for seasonality adjustments",
              "Led KPI-driven reporting, cohort analyses, and experimentation by preprocessing and modeling fact/dimension tables in Redshift using dbt"
            ],
            dataEngineeringInfrastructure: [
              "Designed and implemented batch data pipelines to standardize and transform e-commerce data, supporting KPI reporting across ~1M weekly transactions and accelerating campaign and inventory decision-making by 2x",
              "Built large-scale data processing pipelines using PySpark to analyze ~1M weekly transactions, identifying customer behavior patterns and pricing response signals",
              "Engineered analytics-ready datasets and predictive features for hundreds of SKUs using SQL and Python, reducing campaign reporting and A/B test analysis time by 40%",
              "Implemented incremental batch data pipelines to standardize and transform e-commerce data, supporting recurring reports and ad-hoc analysis"
            ],
            dataModelingBI: [
              "Developed incremental dimensional data models in Amazon Redshift (via dbt) to support fact and dimension loading for BI semantic models, optimizing joins and query patterns and reducing dashboard query times by ~40%",
              "Automated CDC-driven data workflows using Lambda, improving pipeline reliability, ensuring timely data availability, and supporting consistent reporting standards across analytics systems",
              "Developed near real-time dashboards in QuickSight using data from Redshift, enabling marketing and inventory teams to track ~1M weekly transactions and optimize campaign timing and stock levels",
              "Collaborated with data engineers and product managers to automate daily refreshes and monitoring logic using Lambda and Step Functions, ensuring timely insights for leadership and stakeholders"
            ],
            dataQualityDocumentation: [
              "Supported reporting and analytics during the migration of ~2TB of data to AWS, performing migration validation and data quality checks to ensure accuracy and consistency across legacy and cloud systems",
              "Created structured documentation for datasets, metric definitions, migration steps, validation results, and known data caveats, improving transparency and reducing data-related follow-ups from stakeholders"
            ]
          }
        },
        {
          name: "Oil & Gas Supply Chain Client",
          sections: {
            dataEngineeringIntegration: [
              "Built ETL pipelines integrating data from SAP (HANA, Ariba), Salesforce, SQL Server (SSMS), Excel, and flat files to unify operations, procurement, and logistics data, enabling centralized operational analytics across 100+ supply nodes",
              "Implemented data pipelines supporting inventory planning workflows, integrating ABC classification, Monte Carlo simulations, and regression-based reorder logic, reducing manual planning time from 2 days to under 6 hours"
            ],
            analyticsReporting: [
              "Prepared analytics-ready datasets and data models to support Tableau and Power BI (DAX) reporting on inventory turnover, shipment delays, and demand–supply gaps, helping teams reduce excess inventory by ~15%",
              "Designed Power BI dashboards to track inventory turnover, shipment delays, and demand-supply mismatches, helping regional teams reduce stock excess by ~15% and improve on-time delivery rates",
              "Conducted time-series analysis on historical demand and shipment data to identify trends and seasonal patterns across supply nodes, supporting short-term forecasting and proactive inventory planning"
            ],
            optimizationModels: [
              "Implemented inventory planning workflows incorporating ABC classification, Monte Carlo simulations, and regression-based reorder models, reducing manual planning time from 2 days to under 6 hours",
              "Supported the implementation of inventory optimization models using ABC classification, Monte Carlo simulations, and regression-based reorder logic - reducing overstock risk and cutting manual planning time"
            ]
          }
        }
      ]
    },
    {
      company: "DaVinci Corps",
      location: "Mumbai, IN",
      roles: ["Data Scientist", "AI Engineer", "Data Engineer", "Business Intelligence Engineer", "Data Analyst"],
      period: "May 2020 – Aug 2020",
      sections: {
        dataEngineeringPipelines: [
          "Built and maintained near real-time data pipelines on Azure (Data Factory, Synapse) to process 100K+ daily e-commerce events, delivering analytics-ready datasets that supported KPI monitoring within a 10-minute SLA",
          "Built and maintained near real-time data pipelines on Azure to process 100K+ daily transaction events, delivering validated analytics-ready datasets that powered automated KPI dashboards and operational monitoring within a 10-minute SLA"
        ],
        analyticsBI: [
          "Built real-time analytics dashboards in Power BI by processing 100K+ daily e-commerce events through Azure, enabling business teams to monitor KPIs such as customer and revenue drop-offs within a 10-minute SLA",
          "Processed and curated clickstream and transaction data using Python, enabling downstream recommendation workflows that improved cross-sell conversion rates and average order value (AOV)"
        ],
        mlEngineering: [
          "Processed and curated clickstream and transaction data in Python to generate behavioral signals and features for an ALS-based recommendation system, improving cross-sell conversion rates and AOV",
          "Analyzed clickstream and transaction data to surface customer engagement and product affinity trends, supporting a recommendation engine that improved cross-sell conversion and average order value",
          "Collaborated with ML engineers to validate input data quality and integrate model outputs into reporting workflows, ensuring consistent delivery of actionable insights via automated CI/CD pipelines"
        ]
      }
    }
  ],
  projects: [
    {
      name: "Franchify",
      description: "Franchise Supply Chain Automation",
      details: "Built an automated system that enriches raw franchise business data into complete, verified company profiles using AI-driven web research (Stagehand, BigQuery), enabling faster vendor onboarding and more informed supply chain decisions"
    },
    {
      name: "MediCodeAI",
      description: "AI-assisted Medical Coding Analytics",
      details: "Built an AI-assisted ICD-10 workflow using Python and SQL, applying ClinicalBERT with an XGBoost classifier to analyze clinical text and ICD-10 outputs, achieving ~98% validation accuracy and supporting reliable medical data workflows"
    },
    {
      name: "Adnomaly",
      description: "Real-Time Ad Fraud Detection",
      details: [
        "Built a real-time clickstream analytics platform for ad traffic anomaly detection using Kafka streaming, Isolation Forest ML model, and FastAPI serving layer, with Feast feature store and Prometheus monitoring",
        "Engineered a real-time Kafka-Flink pipeline streaming 100+ events/sec and powering an ONNX-optimized anomaly detector with a PostgreSQL + Feast feature store, cutting ad fraud and improving model reliability to 98%",
        "Engineered a real-time analytics pipeline using Kafka and Flink to monitor 100+ events/sec and evaluate anomaly detection performance, improving model reliability to 98% and reducing the impact of ad fraud"
      ]
    },
    {
      name: "MegaCollision",
      description: "Data Modeling and Analytics",
      details: [
        "Built a Kimball-based data model with Talend ETL and SCD2 logic in PostgreSQL to power Tableau dashboards for 3M+ collision records, improving analytics speed and data accuracy",
        "Developed an end-to-end analytics workflow with dimensional modeling and dashboards to analyze 3M+ collision records, surfacing incident trends and insights to support data-driven decision-making"
      ]
    },
    {
      name: "AIVY",
      description: "Gamified Learning Assistant - GenAI",
      details: "Built an AI learning assistant that helps users study more effectively by automatically turning textbooks, images, and YouTube videos into structured lesson plans, quizzes, and flashcards using OpenAI and LangGraph"
    }
  ]
};

// Initialize Pinecone client
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

const EMBED_DIMS_768 = 768;
const EMBED_DIMS_OPENAI = 1536;
const OPEN_TEXT_URL = "https://api.opentextembeddings.com/v1/embeddings";
const OPEN_TEXT_MODEL = "bge-base-en";
const OPENAI_EMBED_MODEL = "text-embedding-3-small";
const HF_EMBED_MODEL = "sentence-transformers/all-mpnet-base-v2";
const HF_LEGACY_URL = `https://api-inference.huggingface.co/models/${HF_EMBED_MODEL}`;

// Sanitize ID to be ASCII-only (Pinecone requirement)
function sanitizeId(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Chunk text intelligently
function chunkText(text, maxChunkSize = 500, overlap = 50) {
  const sentences = text.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const lastSentences = currentChunk.split(/[.!?]\s+/).slice(-2).join(". ");
      currentChunk = lastSentences + " " + sentence;
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

// OpenAI (1536 dims; index must be 1536 — create with PINECONE_INDEX_DIMENSION=1536)
async function embedWithOpenAI(text) {
  const key = OPENAI_API_KEY?.trim();
  if (!key) return null;
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
}

// Open Text Embeddings (free, no API key) — 768 dims
async function embedWithOpenText(text) {
  const res = await fetch(OPEN_TEXT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: text.slice(0, 8192), model: OPEN_TEXT_MODEL }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const vector = json?.data?.[0]?.embedding;
  if (!Array.isArray(vector) || vector.length !== EMBED_DIMS_768) return null;
  return vector;
}

// Hugging Face (optional; needs HUGGINGFACE_API_TOKEN)
async function embedWithHF(text) {
  const token = HUGGINGFACE_API_TOKEN?.trim();
  if (!token) return null;
  const res = await fetch(HF_LEGACY_URL, {
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
    for (let i = 0; i < dim; i++) sum[i] /= vector.length;
    const norm = Math.sqrt(sum.reduce((a, v) => a + v * v, 0)) || 1;
    vector = sum.map((v) => v / norm);
  } else {
    vector = [...vector];
  }
  return vector.length === EMBED_DIMS_768 ? vector : null;
}

async function embedText(text) {
  const openai = await embedWithOpenAI(text);
  if (openai) return openai;
  const openText = await embedWithOpenText(text);
  if (openText) return openText;
  const h = await embedWithHF(text);
  if (h) return h;
  throw new Error(
    "Embeddings failed. Set OPENAI_API_KEY, or use Open Text (no key). If Open Text is down, set HUGGINGFACE_API_TOKEN. See README."
  );
}

// Process and ingest master resume
async function ingestMasterResume() {
  console.log("\n📄 Processing Master Resume...");
  const index = pinecone.index(PINECONE_INDEX_NAME);
  const vectors = [];
  let chunkIndex = 0;

  // Process Contact Information
  const contactText = `Contact: ${masterResume.contact.email}, ${masterResume.contact.phone}. LinkedIn: ${masterResume.contact.linkedin}. GitHub: ${masterResume.contact.github}`;
  const contactChunks = chunkText(contactText);
  for (const chunk of contactChunks) {
    const vector = await embedText(chunk);
    vectors.push({
      id: `master-contact-${chunkIndex}`,
      values: vector,
      metadata: {
        text: chunk,
        section: "contact",
        chunk_index: chunkIndex++,
      },
    });
  }

  // Process Education
  const educationText = `${masterResume.education.degree} from ${masterResume.education.school}, ${masterResume.education.location}. ${masterResume.education.note}. Graduation: ${masterResume.education.graduation}`;
  const eduChunks = chunkText(educationText);
  for (const chunk of eduChunks) {
    const vector = await embedText(chunk);
    vectors.push({
      id: `master-education-${chunkIndex}`,
      values: vector,
      metadata: {
        text: chunk,
        section: "education",
        chunk_index: chunkIndex++,
      },
    });
  }

  // Process Technical Skills
  const skillsText = [
    `Languages: ${masterResume.technicalSkills.languages.join(", ")}`,
    `Databases: ${masterResume.technicalSkills.databases.join(", ")}`,
    `Data Processing: ${masterResume.technicalSkills.frameworks.dataProcessing.join(", ")}`,
    `ML/AI: ${masterResume.technicalSkills.frameworks.mlAI.join(", ")}`,
    `GenAI/LLM: ${masterResume.technicalSkills.frameworks.genAI.join(", ")}`,
    `Workflow: ${masterResume.technicalSkills.frameworks.workflow.join(", ")}`,
    `Cloud: ${masterResume.technicalSkills.platforms.cloud.join(", ")}`,
    `Data Engineering: ${masterResume.technicalSkills.platforms.dataEngineering.join(", ")}`,
    `BI & Visualization: ${masterResume.technicalSkills.platforms.biVisualization.join(", ")}`,
    `DevOps: ${masterResume.technicalSkills.platforms.devops.join(", ")}`,
    `Feature Store: ${masterResume.technicalSkills.platforms.featureStore.join(", ")}`,
    `Data Engineering Competencies: ${masterResume.technicalSkills.coreCompetencies.dataEngineering.join(", ")}`,
    `Data Science Competencies: ${masterResume.technicalSkills.coreCompetencies.dataScience.join(", ")}`,
    `Machine Learning: ${masterResume.technicalSkills.coreCompetencies.machineLearning.join(", ")}`,
    `GenAI & LLM: ${masterResume.technicalSkills.coreCompetencies.genAI.join(", ")}`,
    `Analytics: ${masterResume.technicalSkills.coreCompetencies.analytics.join(", ")}`,
    `Business Intelligence: ${masterResume.technicalSkills.coreCompetencies.businessIntelligence.join(", ")}`,
  ].filter(Boolean).join(". ");

  const skillsChunks = chunkText(skillsText);
  for (const chunk of skillsChunks) {
    const vector = await embedText(chunk);
    vectors.push({
      id: `master-skills-${chunkIndex}`,
      values: vector,
      metadata: {
        text: chunk,
        section: "technical_skills",
        chunk_index: chunkIndex++,
      },
    });
  }

  // Process Experience
  for (const exp of masterResume.experience) {
    const companyId = sanitizeId(exp.company);
    
    // Process sections if they exist
    if (exp.sections) {
      for (const [sectionName, bullets] of Object.entries(exp.sections)) {
        for (const bullet of bullets) {
          const vector = await embedText(bullet);
          vectors.push({
            id: `master-exp-${companyId}-${sanitizeId(sectionName)}-${chunkIndex}`,
            values: vector,
            metadata: {
              text: bullet,
              section: "experience",
              company: exp.company,
              roles: exp.roles.join(", "),
              period: exp.period,
              experience_section: sectionName,
              chunk_index: chunkIndex++,
            },
          });
        }
      }
    }

    // Process projects if they exist
    if (exp.projects) {
      for (const project of exp.projects) {
        for (const [sectionName, bullets] of Object.entries(project.sections || {})) {
          for (const bullet of bullets) {
            const vector = await embedText(bullet);
            vectors.push({
              id: `master-exp-${companyId}-${sanitizeId(project.name)}-${sanitizeId(sectionName)}-${chunkIndex}`,
              values: vector,
              metadata: {
                text: bullet,
                section: "experience",
                company: exp.company,
                project: project.name,
                roles: exp.roles.join(", "),
                period: exp.period,
                experience_section: sectionName,
                chunk_index: chunkIndex++,
              },
            });
          }
        }
      }
    }
  }

  // Process Projects
  for (const project of masterResume.projects) {
    const projectDetails = Array.isArray(project.details) ? project.details.join(" ") : project.details;
    const projectText = `${project.name} - ${project.description}: ${projectDetails}`;
    const vector = await embedText(projectText);
    vectors.push({
      id: `master-project-${sanitizeId(project.name)}-${chunkIndex}`,
      values: vector,
      metadata: {
        text: projectText,
        section: "projects",
        project_name: project.name,
        project_description: project.description,
        chunk_index: chunkIndex++,
      },
    });
  }

  // Upsert in batches
  console.log(`\n📤 Uploading ${vectors.length} vectors...`);
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
    console.log(`   ✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
  }

  console.log(`\n✅ Ingestion complete! Total vectors: ${vectors.length}`);
  return vectors.length;
}

// Main execution
async function main() {
  console.log("🚀 Starting master resume ingestion into Pinecone...");
  console.log(`   Index: ${PINECONE_INDEX_NAME}\n`);

  try {
    const count = await ingestMasterResume();
    console.log(`\n💡 Your RAG system is now ready with the master resume!`);
    console.log(`   Total vectors: ${count}`);
  } catch (error) {
    console.error(`❌ Error processing master resume:`, error.message);
    process.exit(1);
  }
}

main().catch(console.error);
