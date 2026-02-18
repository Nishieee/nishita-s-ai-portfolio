import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const experiences = [
  {
    role: "GenAI Engineer",
    company: "Humanitarians AI",
    period: "Jan 2025 – April 2025",
    points: [
      "Built healthcare platforms using LangChain and FastAPI for intelligent document processing",
      "Designed RAG-based systems for medical knowledge retrieval and clinical decision support",
    ],
  },
  {
    role: "Data Engineer",
    company: "EPM Consultancy",
    period: "Feb 2022 – June 2023",
    points: [
      "Developed PySpark-based e-commerce data pipelines processing millions of transactions",
      "Optimized ETL workflows reducing data processing time by 40%",
    ],
  },
  {
    role: "AI Engineer",
    company: "DaVinci Corps",
    period: "May 2020 – August 2020",
    points: [
      "Developed end-to-end AI solutions for enterprise clients",
      "Implemented machine learning models for predictive analytics and automation",
    ],
  },
  {
    role: "Teaching Assistant",
    company: "Northeastern University",
    period: "Sept 2025 – Dec 2025",
    points: [
      "Human-Centered AI course — guiding students through responsible AI development",
      "Mentored students on AI ethics, bias detection, and fairness in ML systems",
    ],
  },
];

const ExperienceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-24 px-6 bg-card" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-primary mb-3">Experience</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-12">
            Where I've contributed<span className="text-primary">.</span>
          </h2>
        </motion.div>

        <div className="space-y-0">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className="grid md:grid-cols-12 gap-4 py-8 border-t border-border group"
            >
              <div className="md:col-span-3">
                <p className="text-xs text-muted-foreground tracking-wide">{exp.period}</p>
              </div>
              <div className="md:col-span-4">
                <p className="font-medium text-foreground">{exp.role}</p>
                <p className="text-sm text-primary">{exp.company}</p>
              </div>
              <div className="md:col-span-5">
                <ul className="space-y-2">
                  {exp.points.map((point, j) => (
                    <li key={j} className="text-sm text-muted-foreground leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
