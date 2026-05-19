import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const experiences = [
  {
    role: "Data Engineer",
    company: "Humanitarians AI",
    period: "Jan 2025 – April 2025",
    points: [
      "Built and maintained data pipelines for analytics and reporting",
      "Improved data quality and reliability with validation and monitoring",
    ],
  },
  {
    role: "Data Analyst",
    company: "EPM",
    period: "Jan 2023 – Jun 2023",
    points: [
      "Developed data models to support reporting and analysis",
      "Built dashboards and reports for stakeholder decision-making",
    ],
  },
  {
    role: "Data Engineer",
    company: "DaVinci",
    period: "May 2021 – Aug 2021",
    points: [
      "Designed and supported ETL workflows for downstream teams",
      "Collaborated cross-functionally to define data requirements and sources",
    ],
  },
];

const ExperienceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-16 px-6 bg-card" ref={ref}>
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
