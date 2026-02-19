import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";

const { PINECONE_API_KEY, PINECONE_INDEX_NAME, HUGGINGFACE_API_TOKEN } = process.env;

if (!PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
  console.error("❌ Missing required environment variables:");
  console.error("   PINECONE_API_KEY, PINECONE_INDEX_NAME");
  process.exit(1);
}
if (!HUGGINGFACE_API_TOKEN) {
  console.error("❌ Missing HUGGINGFACE_API_TOKEN (required for embeddings)");
  process.exit(1);
}

// Resume data organized by role
const resumes = {
  "Business Intelligence Engineer": {
    summary: `Business Intelligence Engineer with 2+ years of experience supporting reporting, ad-hoc analysis, data quality across e-commerce, healthcare, and supply chain domains. Experienced in ETL workflows, data modeling, and cloud-based analytics platforms.`,
    technicalSkills: {
      languages: ["Python", "SQL", "R"],
      databases: ["Snowflake", "BigQuery", "Amazon RedShift", "PostgreSQL", "MS SQL Server", "MySQL", "Neo4j", "Chroma DB"],
      frameworks: ["pandas", "NumPy", "Matplotlib", "PySpark", "Airflow", "Kafka"],
      platforms: ["Power BI", "Tableau", "QuickSight", "AWS", "GCP", "Azure", "dbt", "DataBricks", "Alteryx", "Talend", "Docker", "Kubernetes"],
      core: ["Dimensional Modeling", "KPI dashboards", "Schema Design", "Data Governance", "Data Warehousing"]
    },
    experience: [
      {
        company: "Humanitarians AI",
        location: "Boston, MA",
        role: "Data Engineer",
        period: "Jan 2025 – Apr 2025",
        bullets: [
          "Led the design and implementation of resolution time metrics across medical diagnostic agentic AI workflow, identifying root causes of delays and partnering with engineering to reduce query resolution time by 22%",
          "Prepared, validated, and documented datasets from 300K+ synthetic clinical records, ensuring data quality and traceability through schema validation and field-level controls to support compliant reporting",
          "Owned system reporting and monitoring for 8,000+ healthcare application interactions, creating standardized reports to track quality, resolution times, and usage metrics in support of operational decision-making",
          "Performed functional validation and A/B testing across 20K+ LLM interactions, standardizing test parameters to assess output quality and identify optimal system configurations"
        ]
      },
      {
        company: "EPM Consultancy",
        location: "Mumbai, IN",
        role: "Business Intelligence Engineer",
        period: "Feb 2022 – Jun 2023",
        projects: [
          {
            name: "eCommerce platform",
            bullets: [
              "Supported reporting and analytics during the migration of ~2TB of transactional and customer data to AWS, performing migration validation and data quality checks to ensure accuracy and consistency across legacy and cloud systems",
              "Implemented batch data pipelines to standardize and transform e-commerce data, supporting recurring reports and ad-hoc analysis across ~1M weekly transactions and accelerating campaign and inventory decision-making by 2x",
              "Developed incremental dimensional data models in Amazon Redshift (via dbt) to support efficient fact and dimension loading, maintaining reporting continuity while optimizing joins and query patterns and reducing dashboard query times by ~40%",
              "Created structured documentation for datasets, metric definitions, migration steps, validation results, and known data caveats, improving transparency and reducing data-related follow-ups from stakeholders"
            ]
          },
          {
            name: "Oil & Gas Supply Chain Client",
            bullets: [
              "Built ETL pipelines sourcing data from SAP (HANA, Ariba), Salesforce, SQL Server, and flat files to consolidate operations, procurement, and logistics data, enabling unified analytics across 100+ supply nodes",
              "Prepared analytics-ready datasets and data models to support Tableau reporting on inventory turnover, shipment delays, and demand–supply gaps, helping teams reduce excess inventory by ~15%",
              "Implemented data pipelines to automate inventory planning workflows, integrating ABC classification, Monte Carlo simulations, and regression-based reorder logic, reducing manual planning time from 2 days to under 6 hours"
            ]
          }
        ]
      },
      {
        company: "DaVinci Corps",
        location: "Mumbai, IN",
        role: "Business Intelligence Engineer",
        period: "May 2020 – Aug 2020",
        bullets: [
          "Built and maintained near real-time data pipelines on Azure to process 100K+ daily e-commerce events, delivering analytics-ready datasets that powered KPI monitoring within a 10-minute SLA",
          "Processed and curated clickstream and transaction data using Python, enabling downstream recommendation workflows that improved cross-sell conversion rates and average order value (AOV)"
        ]
      }
    ],
    education: {
      school: "Northeastern University",
      degree: "Master of Science, Information Systems",
      location: "Boston, MA",
      graduation: "Dec 2025",
      note: "Teaching Assistant, Human-Centered AI: supported 150+ students in understanding Responsible AI"
    },
    projects: [
      {
        name: "MegaCollision",
        description: "Data Modeling and Analytics",
        details: "Built a Kimball-based data model with Talend ETL and SCD2 logic in PostgreSQL to power Tableau dashboards for 3M+ collision records, improving analytics speed and data accuracy"
      },
      {
        name: "Franchify",
        description: "Franchise Supply Chain Automation",
        details: "Built an automated system that enriches raw franchise business data into complete, verified company profiles using AI-driven web research (stagehand, BigQuery), enabling faster vendor onboarding and more informed supply chain decisions"
      }
    ]
  },
  "Data Engineer": {
    summary: `Data Engineer with 2+ years of experience building scalable batch and near real-time data pipelines across e-commerce, healthcare, and supply chain domains. Strong in designing incremental ETL workflows, data models, and cloud-based data platforms that deliver reliable, analytics-ready datasets for downstream reporting and ML systems.`,
    technicalSkills: {
      languages: ["Python", "SQL", "R", "Java"],
      databases: ["Snowflake", "PostgreSQL", "MS SQL Server", "MySQL", "MongoDB", "Neo4j", "Chroma DB"],
      frameworks: ["NumPy", "pandas", "Seaborn", "Matplotlib", "scikit-learn", "Hadoop", "Hive", "PySpark", "Airflow", "Kafka"],
      platforms: ["AWS (S3, EMR, RedShift)", "Azure", "dbt", "DataBricks", "Power BI", "Tableau", "Docker", "Kubernetes", "Hugging Face"],
      core: ["Dimensional Modeling", "KPI dashboards", "Schema Design", "Data Governance", "Data Warehousing"]
    },
    experience: [
      {
        company: "Humanitarians AI",
        location: "Boston, MA",
        role: "Data Engineer",
        period: "Jan 2025 – Apr 2025",
        bullets: [
          "Led a team of 3 in the implementation of an end-to-end agentic AI healthcare platform using LangChain and MCP, enabling dynamic agent interactions with agent state stored and retrieved from a vector database (RAG)",
          "Built HIPAA-compliant data workflows processing 300K+ synthetic clinical personas for testing and fine-tuning MiniLM-based embedding model, reducing token usage and improving retrieval performance for vector-based agent memory",
          "Evaluated multi-model GenAI orchestration across OpenAI, Amazon Bedrock, Vertex AI, and Cohere using prompt engineering and A/B testing to identify optimal models based on accuracy, latency, and response quality",
          "Integrated backend APIs and a React-based interface to support human-in-the-loop review and iteration, enabling seamless interaction between agent workflows, evaluation outputs, and internal user feedback"
        ]
      },
      {
        company: "EPM Consultancy",
        location: "Mumbai, IN",
        role: "Data Engineer",
        period: "Feb 2022 – Jun 2023",
        projects: [
          {
            name: "eCommerce platform",
            bullets: [
              "Migrated high-volume transactional and customer data (~2TB) from on-prem databases to Amazon S3, reducing query latency by ~30% and enabling scalable reporting for business operations",
              "Designed and implemented batch data pipelines in AWS Glue (PySpark) to standardize and transform e-commerce data, supporting KPI reporting across ~1M weekly transactions and accelerating campaign and inventory decision-making by 3x",
              "Developed incremental dimensional data models in RedShift (via dbt) to support fact and dimension loading for BI semantic models, optimizing joins and query patterns and reducing dashboard query times by ~40%",
              "Automated CDC-driven data workflows using Lambda, improving pipeline reliability, ensuring timely data availability, and supporting consistent reporting standards across analytics systems"
            ]
          },
          {
            name: "Oil & Gas Supply Chain Client",
            bullets: [
              "Built ETL pipelines integrating data from SAP (HANA, Ariba), SQL Server (SSMS), Excel, and flat files to unify operations, procurement, and logistics data using Alteryx, enabling centralized operational analytics across 100+ supply nodes",
              "Prepared analytics-ready datasets and data models to support PowerBI (DAX) reporting on inventory turnover, shipment delays, and demand–supply gaps, helping teams reduce excess inventory by ~15%",
              "Implemented data pipelines supporting inventory planning workflows, integrating ABC classification, Monte Carlo simulations, and regression-based reorder logic, reducing manual planning time from 2 days to under 6 hours"
            ]
          }
        ]
      },
      {
        company: "DaVinci Corps",
        location: "Mumbai, IN",
        role: "Data Engineer",
        period: "May 2020 – Aug 2020",
        bullets: [
          "Built and maintained near real-time data pipelines on Azure to process 100K+ daily e-commerce events, delivering analytics-ready datasets that powered KPI monitoring within a 10-minute SLA",
          "Processed and curated clickstream and transaction data using Python, enabling downstream recommendation workflows that improved cross-sell conversion rates and average order value (AOV)"
        ]
      }
    ],
    education: {
      school: "Northeastern University",
      degree: "Master of Science, Information Systems",
      location: "Boston, MA",
      graduation: "Dec 2025",
      note: "Teaching Assistant, Human-Centered AI: supported 150+ students in understanding Responsible AI"
    },
    projects: [
      {
        name: "Adnomaly",
        description: "Real-time ad clickstream anomaly detection",
        details: "Engineered a real-time Kafka-Flink pipeline streaming 100+ events/sec and powering an ONNX-optimized anomaly detector with a PostgreSQL + Feast feature store, cutting ad fraud and improving model reliability to 98%"
      },
      {
        name: "AIVY",
        description: "Gamified learning Assistant - GenAI",
        details: "Built an AI learning assistant that helps users study more effectively by automatically turning textbooks, images, and YouTube videos into structured lesson plans, quizzes, and flashcards using OpenAI and LangGraph"
      }
    ]
  },
  "Data Analyst": {
    summary: `2+ years of Data Analyst experience translating large, complex datasets into actionable insights across e-commerce, supply chain, and healthcare domains. Strong in SQL, Python, and BI dashboards to support data-driven decision-making.`,
    technicalSkills: {
      languages: ["Python", "SQL", "R"],
      databases: ["Snowflake", "PostgreSQL", "MS SQL Server", "MySQL", "MongoDB", "Oracle DB"],
      frameworks: ["NumPy", "pandas", "Seaborn", "Matplotlib", "scikit-learn", "Spark", "Airflow", "Kafka"],
      platforms: ["Alteryx", "Talend", "Power BI", "Tableau", "AWS", "GCP", "Azure", "dbt", "DataBricks", "Docker", "Kubernetes"],
      core: ["Dimensional Modeling", "KPI dashboards", "Schema Design", "Data Governance", "Data Warehousing"]
    },
    experience: [
      {
        company: "Humanitarians AI",
        location: "Boston, MA",
        role: "Data Engineer",
        period: "Jan 2025 – Apr 2025",
        bullets: [
          "Led the design and implementation of scalable data workflows supporting 1K+ GenAI healthcare interactions, improving medical query resolution latency by 22% while enabling operational monitoring",
          "Built HIPAA-compliant data pipelines processing 2M+ synthetic clinical records, establishing standardized validation, PII masking, and access controls to ensure data quality for secure analytics and AI workloads",
          "Designed automated evaluation pipelines for large-scale GenAI systems, analyzing 8,000+ interactions to optimize cost and performance trade-offs, tracking accuracy and performance KPIs and reducing token usage costs by 35%",
          "Standardized multi-model logging and output schemas across LLM providers, including OpenAI, Amazon Bedrock, and Vertex AI, enabling reliable A/B testing at scale and reporting-ready outputs across 20K+ interactions"
        ]
      },
      {
        company: "EPM Consultancy",
        location: "Mumbai, IN",
        role: "Data Analyst",
        period: "Feb 2022 – Jun 2023",
        projects: [
          {
            name: "eCommerce platform",
            bullets: [
              "Supported operational reporting during the migration of ~2TB of transactional and customer data to AWS, performing validation and data quality checks using python to ensure accuracy and consistency across legacy and cloud systems",
              "Implemented batch data pipelines to standardize e-commerce data, supporting reporting and ad-hoc analysis across ~1M weekly transactions and accelerating campaign and inventory decision-making by 3x",
              "Developed incremental dimensional data models in Amazon Redshift (via dbt) to support analytics-ready datasets, maintaining reporting continuity while optimizing joins, query patterns, and QuickSight dashboard performance by ~40%",
              "Created structured reporting documentation for datasets, KPI logic, migration steps, validation results, and known data caveats, improving transparency for stakeholders"
            ]
          },
          {
            name: "Oil & Gas Supply Chain Client",
            bullets: [
              "Consolidated operations, procurement, and logistics data from SAP HANA, SAP Ariba, SQL Server (via SSMS), Excel, and flat files using Alteryx, improving visibility across 100+ supply nodes and enabling near real-time supply chain analysis",
              "Designed Tableau dashboards to track inventory turnover, shipment delays, and demand-supply mismatches, helping regional teams reduce stock excess by ~15% and improve on-time delivery rates",
              "Analyzed inventory and demand patterns using ABC classification, Monte Carlo simulations, and regression-based reorder logic, reducing overstock risk and cutting manual planning time from 2 days to under 6 hours"
            ]
          }
        ]
      },
      {
        company: "DaVinci Corps",
        location: "Mumbai, IN",
        role: "Data Analyst",
        period: "May 2020 – Aug 2020",
        bullets: [
          "Built near real-time Power BI dashboards analyzing 100K+ daily e-commerce events via Azure cloud, enabling business teams to monitor KPIs within a 10-minute SLA",
          "Curated clickstream and transaction data using Python and SQL, optimizing queries with window functions and CTEs to enable downstream recommendation workflows that improved cross-sell conversion rates and average order value (AOV)"
        ]
      }
    ],
    education: {
      school: "Northeastern University",
      degree: "Master of Science, Information Systems",
      location: "Boston, MA",
      graduation: "Dec 2025",
      note: "Teaching Assistant, Human-Centered AI: supported 150+ students in understanding Responsible AI"
    },
    projects: [
      {
        name: "MediCodeAI",
        description: "AI-assisted medical coding analytics",
        details: "Built an AI-assisted ICD-10 workflow using Python and SQL, applying ClinicalBERT with an XGBoost classifier to analyze clinical text and ICD-10 outputs, achieving ~98% validation accuracy and supporting reliable medical data workflows"
      },
      {
        name: "MegaCollision",
        description: "Data Modeling and Analytics",
        details: "Built a Kimball-based data model with Talend ETL and SCD2 logic in PostgreSQL to power Tableau dashboards for 3M+ collision records, improving analytics speed and data accuracy"
      }
    ]
  },
  "Data Scientist": {
    summary: `Data Scientist with 2+ years of experience in statistical analysis, experimentation, and machine learning across large-scale datasets in e-commerce, healthcare, and supply chain domains, with strengths in EDA, feature engineering, and applied ML.`,
    technicalSkills: {
      languages: ["Python", "SQL", "R"],
      databases: ["Snowflake", "BigQuery", "PostgreSQL", "MS SQL Server", "MySQL", "MongoDB", "Neo4j", "Chroma DB"],
      frameworks: ["NumPy", "pandas", "Seaborn", "Matplotlib", "scikit-learn", "PyTorch", "TensorFlow", "PySpark", "Airflow", "Kafka"],
      platforms: ["AWS", "GCP", "dbt", "DataBricks", "Docker", "Kubernetes", "Hugging Face"],
      dataScience: ["EDA", "Statistical Analysis", "Regression", "Classification", "Churn Prediction", "Time-Series Analysis", "Cohort Analysis"],
      mlGenAI: ["Predictive Modeling", "Feature Engineering", "RAG", "LangChain", "LangGraph", "LlamaIndex", "Vector DBs"]
    },
    experience: [
      {
        company: "Humanitarians AI",
        location: "Boston, MA",
        role: "GenAI Engineer",
        period: "Jan 2025 – Apr 2025",
        bullets: [
          "Led a team of 3 in the implementation of an end-to-end agentic AI healthcare platform on GCP using LangChain and MCP, enabling dynamic agent interactions with agent state stored and retrieved from a vector database (RAG)",
          "Built HIPAA-compliant data workflows processing 300K+ synthetic clinical personas for testing and fine-tuning MiniLM-based embedding model, reducing token usage and improving retrieval performance for vector-based agent memory",
          "Evaluated multi-model GenAI orchestration across OpenAI, Vertex AI, and Cohere using prompt engineering and A/B testing to identify optimal models based on accuracy, latency, and response quality",
          "Developed automated LLM evaluation pipeline analyzing 8,000+ interactions to track hallucination rates, latency, and cost trade-offs, reducing operational costs by 35% while maintaining production-grade response quality",
          "Integrated backend APIs and a React-based interface to support human-in-the-loop review and iteration, enabling seamless interaction between agent workflows, evaluation outputs, and internal user feedback"
        ]
      },
      {
        company: "EPM Consultancy",
        location: "Mumbai, IN",
        role: "Product Data Scientist",
        period: "Feb 2022 – Jun 2023",
        projects: [
          {
            name: "eCommerce platform – Growth",
            bullets: [
              "Performed exploratory data analysis (EDA) on large-scale transaction data (~1M rows weekly) to identify customer behavior patterns, conversion drivers, and response to pricing changes, translating insights into actionable recommendations",
              "Collaborated with product and growth teams to define campaign hypotheses and success metrics (KPIs), applying statistical analysis and predictive models (logistic regression, decision trees) to support customer targeting and campaign optimization",
              "Built cohort-based and pre/post analysis frameworks in Python to measure conversion lift, behavioral impact, and post-launch performance using seasonality-adjusted time-series analysis"
            ]
          },
          {
            name: "Oil & Gas Supply Chain Client",
            bullets: [
              "Prepared analytics-ready datasets and data models to support reporting on inventory turnover, shipment delays, and demand–supply gaps, helping teams reduce excess inventory by ~15%",
              "Implemented inventory planning workflows incorporating ABC classification, Monte Carlo simulations, and regression-based reorder models, reducing manual planning time from 2 days to under 6 hours",
              "Conducted time-series analysis on historical demand and shipment data to identify trends and seasonal patterns across supply nodes, supporting short-term forecasting and proactive inventory planning"
            ]
          }
        ]
      },
      {
        company: "DaVinci Corps",
        location: "Mumbai, IN",
        role: "Data Scientist",
        period: "May 2020 – Aug 2020",
        bullets: [
          "Built and maintained near real-time data pipelines on Azure to process 100K+ daily e-commerce events, delivering analytics-ready datasets that supported KPI monitoring within a 10-minute SLA",
          "Processed and curated clickstream and transaction data in Python to generate behavioral signals and features for an ALS-based recommendation system, improving cross-sell conversion rates and AOV"
        ]
      }
    ],
    education: {
      school: "Northeastern University",
      degree: "Master of Science, Information Systems",
      location: "Boston, MA",
      graduation: "Dec 2025",
      note: "Teaching Assistant, Human-Centered AI: supported 150+ students in understanding Responsible AI"
    },
    projects: [
      {
        name: "Franchify",
        description: "Franchise Supply Chain Automation",
        details: "Built an automated system that enriches raw franchise business data into complete, verified company profiles using AI-driven web research (Stagehand, BigQuery), enabling faster vendor onboarding and more informed supply chain decisions"
      },
      {
        name: "MediCodeAI",
        description: "AI-assisted medical coding analytics",
        details: "Built an AI-assisted ICD-10 workflow using Python and SQL, applying ClinicalBERT with an XGBoost classifier to analyze clinical text and ICD-10 outputs, achieving ~98% validation accuracy and supporting reliable medical data workflows"
      }
    ]
  }
};

// Initialize Pinecone client
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

const HF_EMBED_MODEL = "sentence-transformers/all-mpnet-base-v2";
const HF_EMBED_DIMS = 768;

// Sanitize ID to be ASCII-only (Pinecone requirement)
function sanitizeId(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "") // Remove non-ASCII and non-alphanumeric except hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

// Chunk text intelligently
function chunkText(text, maxChunkSize = 500, overlap = 50) {
  const sentences = text.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Overlap: keep last few sentences
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

// Generate embedding via Hugging Face Inference API (same 768-dim model as server)
async function embedText(text) {
  try {
    const res = await fetch(
      `https://router.huggingface.co/hf-inference/models/${HF_EMBED_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text.slice(0, 8192),
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
    let vector = Array.isArray(raw) ? raw : null;
    if (!vector || vector.length === 0) {
      throw new Error("Unexpected embedding response: empty or not array");
    }
    if (Array.isArray(vector[0])) {
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
    console.error(`Error embedding text: ${error.message}`);
    throw error;
  }
}

// Process and ingest resume
async function ingestResume(roleName, resumeData) {
  console.log(`\n📄 Processing resume for: ${roleName}`);
  const index = pinecone.index(PINECONE_INDEX_NAME);
  const vectors = [];
  let chunkIndex = 0;

  // Process summary
  const summaryChunks = chunkText(resumeData.summary);
  for (const chunk of summaryChunks) {
    const vector = await embedText(chunk);
    vectors.push({
      id: `${roleName.toLowerCase().replace(/\s+/g, "-")}-summary-${chunkIndex}`,
      values: vector,
      metadata: {
        text: chunk,
        role: roleName,
        section: "summary",
        chunk_index: chunkIndex++,
      },
    });
  }

  // Process technical skills
  const skillsText = [
    `Languages: ${resumeData.technicalSkills.languages?.join(", ") || ""}`,
    `Databases: ${resumeData.technicalSkills.databases?.join(", ") || ""}`,
    `Frameworks: ${resumeData.technicalSkills.frameworks?.join(", ") || ""}`,
    `Platforms: ${resumeData.technicalSkills.platforms?.join(", ") || ""}`,
    `Core Skills: ${resumeData.technicalSkills.core?.join(", ") || ""}`,
    resumeData.technicalSkills.dataScience ? `Data Science: ${resumeData.technicalSkills.dataScience.join(", ")}` : "",
    resumeData.technicalSkills.mlGenAI ? `ML & GenAI: ${resumeData.technicalSkills.mlGenAI.join(", ")}` : "",
  ].filter(Boolean).join(". ");

  const skillsChunks = chunkText(skillsText);
  for (const chunk of skillsChunks) {
    const vector = await embedText(chunk);
    vectors.push({
      id: `${sanitizeId(roleName)}-skills-${chunkIndex}`,
      values: vector,
      metadata: {
        text: chunk,
        role: roleName,
        section: "technical_skills",
        chunk_index: chunkIndex++,
      },
    });
  }

  // Process experience
  for (const exp of resumeData.experience) {
    const expHeader = `${exp.role} at ${exp.company}, ${exp.location} (${exp.period})`;
    const bullets = exp.bullets || [];
    const projects = exp.projects || [];

    // Process main bullets
    for (const bullet of bullets) {
      const vector = await embedText(bullet);
      vectors.push({
        id: `${sanitizeId(roleName)}-exp-${sanitizeId(exp.company)}-${chunkIndex}`,
        values: vector,
        metadata: {
          text: bullet,
          role: roleName,
          section: "experience",
          company: exp.company,
          job_role: exp.role,
          period: exp.period,
          chunk_index: chunkIndex++,
        },
      });
    }

    // Process project-specific bullets
    for (const project of projects) {
      for (const bullet of project.bullets || []) {
        const vector = await embedText(bullet);
        vectors.push({
          id: `${sanitizeId(roleName)}-exp-${sanitizeId(exp.company)}-${sanitizeId(project.name)}-${chunkIndex}`,
          values: vector,
          metadata: {
            text: bullet,
            role: roleName,
            section: "experience",
            company: exp.company,
            project: project.name,
            job_role: exp.role,
            period: exp.period,
            chunk_index: chunkIndex++,
          },
        });
      }
    }
  }

  // Process education
  const educationText = `${resumeData.education.degree} from ${resumeData.education.school}, ${resumeData.education.location}. ${resumeData.education.note || ""} Graduation: ${resumeData.education.graduation}`;
  const eduChunks = chunkText(educationText);
  for (const chunk of eduChunks) {
    const vector = await embedText(chunk);
    vectors.push({
      id: `${sanitizeId(roleName)}-education-${chunkIndex}`,
      values: vector,
      metadata: {
        text: chunk,
        role: roleName,
        section: "education",
        chunk_index: chunkIndex++,
      },
    });
  }

  // Process projects
  for (const project of resumeData.projects) {
    const projectText = `${project.name} - ${project.description}: ${project.details}`;
    const vector = await embedText(projectText);
    vectors.push({
      id: `${sanitizeId(roleName)}-project-${sanitizeId(project.name)}-${chunkIndex}`,
      values: vector,
      metadata: {
        text: projectText,
        role: roleName,
        section: "projects",
        project_name: project.name,
        chunk_index: chunkIndex++,
      },
    });
  }

  // Upsert in batches
  console.log(`   📤 Uploading ${vectors.length} vectors...`);
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
    console.log(`   ✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
  }

  console.log(`   ✅ Completed ${roleName}: ${vectors.length} vectors uploaded`);
  return vectors.length;
}

// Main execution
async function main() {
  console.log("🚀 Starting resume ingestion into Pinecone...");
  console.log(`   Index: ${PINECONE_INDEX_NAME}`);
  console.log(`   Roles: ${Object.keys(resumes).join(", ")}\n`);

  let totalVectors = 0;
  for (const [roleName, resumeData] of Object.entries(resumes)) {
    try {
      const count = await ingestResume(roleName, resumeData);
      totalVectors += count;
      // Small delay between roles
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error processing ${roleName}:`, error.message);
    }
  }

  console.log(`\n✅ Ingestion complete! Total vectors: ${totalVectors}`);
  console.log("\n💡 Your RAG system is now ready to answer role-specific questions!");
}

main().catch(console.error);
