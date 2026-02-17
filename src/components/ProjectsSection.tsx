import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Github } from "lucide-react";

const projects = [
  {
    title: "DocQuest",
    description: "A GenAI-powered research agent that intelligently processes and queries academic documents using RAG architecture.",
    stack: ["LangChain", "FastAPI", "Python", "RAG"],
    github: "#",
  },
  {
    title: "AIVY",
    description: "Gamified learning assistant that makes education interactive through AI-driven personalized learning paths.",
    stack: ["React", "Python", "OpenAI", "Gamification"],
    github: "#",
  },
  {
    title: "Finlo",
    description: "AI-powered financial management system designed for small businesses, automating bookkeeping and insights.",
    stack: ["Python", "FastAPI", "ML", "AWS"],
    github: "#",
  },
];

const ProjectsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="py-24 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-primary mb-3">Projects</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-12">
            Selected work<span className="text-primary">.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className="group p-6 rounded-lg border border-border bg-card hover:border-primary/30 transition-all duration-300 hover-lift"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-serif text-2xl font-medium text-foreground">{project.title}</h3>
                <a
                  href={project.github}
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
    </section>
  );
};

export default ProjectsSection;
