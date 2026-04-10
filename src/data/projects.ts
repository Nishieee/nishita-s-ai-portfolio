export type Project = {
  title: string;
  description: string;
  stack: string[];
  github: string;
  /** When true, this card appears on the home page (keep exactly three). */
  showOnHome: boolean;
};

const GITHUB_BASE = "https://github.com/nishieee";

export const allProjects: Project[] = [
  {
    title: "DocQuest",
    description:
      "A GenAI-powered research agent that intelligently processes and queries academic documents using RAG architecture.",
    stack: ["LangChain", "FastAPI", "Python", "RAG"],
    github: `${GITHUB_BASE}/DocQuest`,
    showOnHome: true,
  },
  {
    title: "AIVY",
    description:
      "Gamified learning assistant that makes education interactive through AI-driven personalized learning paths.",
    stack: ["React", "Python", "OpenAI", "Gamification"],
    github: `${GITHUB_BASE}/AIVY`,
    showOnHome: true,
  },
  {
    title: "Finlo",
    description:
      "AI-powered financial management system designed for small businesses, automating bookkeeping and insights.",
    stack: ["Python", "FastAPI", "ML", "AWS"],
    github: `${GITHUB_BASE}/Finlo`,
    showOnHome: true,
  },
  {
    title: "LootStream",
    description:
      "Real-time gaming economy analytics inspired by freemium mobile games: synthetic events flow through Kafka (Avro) into Snowflake via Kafka Connect and Snowpipe Streaming, with bronze landing tables for purchases, upgrades, chests, and trades.",
    stack: ["Python", "Kafka", "Snowflake", "Docker", "Avro"],
    github: "https://github.com/Nishieee/LootStream",
    showOnHome: false,
  },
  {
    title: "MegaCollision",
    description:
      "End-to-end data engineering for motor vehicle collisions across New York, Chicago, and Austin — Talend ETL, star-schema warehousing on Azure SQL, and Power BI / Tableau for traffic-safety insights.",
    stack: ["Talend", "Azure SQL", "Power BI", "Tableau", "SQL"],
    github: "https://github.com/Nishieee/MegaCollision",
    showOnHome: false,
  },
  {
    title: "medicode",
    description:
      "Converts clinical notes into accurate ICD-10 codes using NLP and deep learning.",
    stack: ["Python", "NLP", "Deep Learning", "Healthcare"],
    github: "https://github.com/nishieee/medicode",
    showOnHome: false,
  },
];

export const homeProjects = allProjects.filter((p) => p.showOnHome);
