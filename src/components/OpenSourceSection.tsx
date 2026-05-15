import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GitPullRequest, Star, GitBranch } from "lucide-react";

const contributions = [
  {
    name: "Apache Airflow",
    tagline: "Workflow orchestration",
    description:
      "Contributing to providers, operators, and documentation for the leading open-source workflow orchestrator.",
    stat: "30k+ stars",
    icon: "🪂",
    href: "https://github.com/apache/airflow/pulls?q=is%3Apr+author%3A%40me",
    accent: "from-teal/30 via-primary/20 to-transparent",
    prs: [
      { label: "PR #66968", url: "https://github.com/apache/airflow/pull/66968" },
      { label: "PR #66966", url: "https://github.com/apache/airflow/pull/66966" },
      { label: "PR #66965", url: "https://github.com/apache/airflow/pull/66965" },
    ],
  },
  {
    name: "OpenSearch (AWS)",
    tagline: "Search & analytics suite",
    description:
      "Improving search relevance, plugins, and observability for the community-driven OpenSearch project.",
    stat: "10k+ stars",
    icon: "🔍",
    href: "https://github.com/opensearch-project",
    accent: "from-primary/30 via-teal/20 to-transparent",
    prs: [
      { label: "Docs #12383", url: "https://github.com/opensearch-project/documentation-website/pull/12383" },
      { label: "Docs #12371", url: "https://github.com/opensearch-project/documentation-website/pull/12371" },
    ],
  },
];

const OpenSourceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="opensource" className="relative py-28 px-6 overflow-hidden" ref={ref}>
      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-1/4 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-[24rem] h-[24rem] rounded-full bg-teal/15 blur-3xl"
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-primary mb-3 flex items-center gap-2">
            <GitPullRequest size={14} /> Open Source
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
            Actively contributing to<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Giving back to the tools that power modern data and search infrastructure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {contributions.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div
                className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl`}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-5xl">{c.icon}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-3 py-1 bg-background/50">
                    <Star size={12} className="text-primary" /> {c.stat}
                  </div>
                </div>
                <h3 className="font-serif text-3xl font-medium text-foreground mb-1">
                  {c.name}
                </h3>
                <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">
                  {c.tagline}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {c.description}
                </p>

                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Merged PRs
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {c.prs.map((pr) => (
                    <a
                      key={pr.url}
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <GitPullRequest size={11} />
                      {pr.label}
                    </a>
                  ))}
                </div>

                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <GitBranch size={14} />
                  <span>View all contributions</span>
                  <span className="transition-transform group-hover:translate-x-1.5">→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpenSourceSection;
