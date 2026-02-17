import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
  { category: "Languages", items: ["Python", "SQL", "JavaScript", "R"] },
  { category: "Frameworks", items: ["LangChain", "FastAPI", "PySpark", "React", "Pandas"] },
  { category: "Cloud", items: ["AWS", "GCP", "Azure"] },
  { category: "Tools", items: ["Docker", "Kubernetes", "Airflow", "dbt", "Tableau", "Snowflake"] },
  { category: "ML/AI", items: ["TensorFlow", "PyTorch", "Hugging Face", "RAG Systems"] },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-primary mb-3">About</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-8">
            Building with purpose<span className="text-primary">.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-12">
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-muted-foreground leading-relaxed mb-4">
              I'm passionate about building scalable data systems and AI applications that make a real impact. 
              My journey has taken me from GenAI engineering to data engineering to AI solutions—each role 
              deepening my understanding of how intelligent systems can transform industries.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Currently pursuing my Master's in Information Systems at Northeastern University, 
              I combine academic rigor with hands-on experience in LLMs, data pipelines, 
              and cloud architecture to create solutions that are both elegant and effective.
            </p>
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="space-y-5">
              {skills.map((group) => (
                <div key={group.category}>
                  <p className="text-xs tracking-[0.15em] uppercase text-foreground font-medium mb-2">
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
