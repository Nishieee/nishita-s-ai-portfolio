import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, ArrowUpRight } from "lucide-react";

const articles = [
  {
    title: "I Thought I Was a Data Engineer. Then I Touched Real Code.",
    url: "https://nishitamatlani.substack.com/p/i-thought-i-was-a-data-engineer-then",
    date: "Latest",
    image:
      "https://substackcdn.com/image/fetch/$s_!gAh8!,w_520,h_272,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fce65d4b5-842e-4ff7-b279-6d73bc27b44d_1024x608.png",
  },
  {
    title: "Why Most Analytics Databases Fail",
    url: "https://nishitamatlani.substack.com/p/why-most-analytics-databases-fail",
    date: "Jan 4",
    image:
      "https://substackcdn.com/image/fetch/$s_!Jb8g!,w_520,h_272,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F430607d3-34a3-4d60-bf47-c1fffa52f799_1024x1024.png",
  },
  {
    title: "I Followed a SQL Query All the Way Down",
    url: "https://nishitamatlani.substack.com/p/i-followed-a-sql-query-all-the-way",
    date: "Dec 18",
    image:
      "https://substackcdn.com/image/fetch/$s_!HGYe!,w_520,h_272,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3058bf47-4eb8-4973-8f12-a338950ddc18_1408x768.png",
  },
];

const ArticlesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="articles" className="py-16 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-primary mb-3 flex items-center gap-2">
            <FileText size={14} /> Writing
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
            Articles<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Notes on data engineering, SQL, and the journey of building real systems.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.a
              key={article.title}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className="group block rounded-2xl border border-border bg-card overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center">
                    <ArrowUpRight size={14} className="text-foreground" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {article.date}
                </p>
                <h3 className="font-serif text-lg font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="https://substack.com/@nishitamatlani"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            Read more on Substack
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
