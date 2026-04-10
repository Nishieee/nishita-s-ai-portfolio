import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Github } from "lucide-react";

const projects = [
  {
    title: "LootStream",
    description:
      "Real-time gaming economy analytics inspired by freemium mobile games: synthetic events flow through Kafka (Avro) into Snowflake via Kafka Connect and Snowpipe Streaming, with bronze landing tables for purchases, upgrades, chests, and trades.",
    stack: ["Python", "Kafka", "Snowflake", "Docker", "Avro"],
    github: "https://github.com/Nishieee/LootStream",
  },
  {
    title: "MegaCollision",
    description:
      "End-to-end data engineering for motor vehicle collisions across New York, Chicago, and Austin — Talend ETL, star-schema warehousing on Azure SQL, and Power BI / Tableau for traffic-safety insights.",
    stack: ["Talend", "Azure SQL", "Power BI", "Tableau", "SQL"],
    github: "https://github.com/Nishieee/MegaCollision",
  },
  {
    title: "medicode",
    description:
      "Converts clinical notes into accurate ICD-10 codes using NLP and deep learning.",
    stack: ["Python", "NLP", "Deep Learning", "Healthcare"],
    github: "https://github.com/nishieee/medicode",
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

        <div className="mt-10 text-center">
          <a
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            View all projects
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
