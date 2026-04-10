import { motion } from "framer-motion";
import { Github, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const GITHUB_BASE = "https://github.com/nishieee";

const projects = [
  {
    title: "DocQuest",
    description: "A GenAI-powered research agent that intelligently processes and queries academic documents using RAG architecture.",
    stack: ["LangChain", "FastAPI", "Python", "RAG"],
    github: `${GITHUB_BASE}/DocQuest`,
  },
  {
    title: "AIVY",
    description: "Gamified learning assistant that makes education interactive through AI-driven personalized learning paths.",
    stack: ["React", "Python", "OpenAI", "Gamification"],
    github: `${GITHUB_BASE}/AIVY`,
  },
  {
    title: "Finlo",
    description: "AI-powered financial management system designed for small businesses, automating bookkeeping and insights.",
    stack: ["Python", "FastAPI", "ML", "AWS"],
    github: `${GITHUB_BASE}/Finlo`,
  },
  {
    title: "Portfolio Chat",
    description: "This very portfolio! Features a RAG-powered AI chatbot that can answer questions about my resume and experience.",
    stack: ["React", "TypeScript", "Supabase", "pgvector"],
    github: `${GITHUB_BASE}/nishita-portfolio`,
  },
  {
    title: "Data Pipeline Orchestrator",
    description: "An automated data pipeline orchestration tool that manages ETL workflows across multiple data sources.",
    stack: ["Python", "Airflow", "AWS", "Docker"],
    github: `${GITHUB_BASE}`,
  },
  {
    title: "Sentiment Analyzer",
    description: "Real-time sentiment analysis dashboard for social media data using NLP and streaming architecture.",
    stack: ["Python", "Kafka", "NLP", "React"],
    github: `${GITHUB_BASE}`,
  },
];

const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          Back home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-primary mb-3">Projects</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
            All projects<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground mb-12 max-w-xl">
            A collection of things I've built — from AI-powered tools to data engineering systems.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i }}
              className="group p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-all duration-300 hover-lift"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-serif text-2xl font-medium text-foreground">{project.title}</h2>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`View ${project.title} on GitHub`}
                >
                  <Github size={18} />
                </a>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
