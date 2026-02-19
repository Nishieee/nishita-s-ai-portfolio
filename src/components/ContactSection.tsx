import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Linkedin, Github, MapPin } from "lucide-react";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-24 px-6 bg-card" ref={ref}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm tracking-[0.2em] uppercase text-primary mb-3">Get in Touch</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">
            Let's connect<span className="text-primary">.</span>
          </h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto leading-relaxed">
            Open to opportunities in Data Engineering, AI Engineering, and Business Intelligence.
          </p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-10">
            <MapPin size={12} /> Boston, MA
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center gap-6"
        >
          <a
            href="mailto:matlaninishi@gmail.com"
            className="flex items-center gap-2 px-5 py-2.5 text-sm border border-border rounded-full text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            <Mail size={16} /> Email
          </a>
          <a
            href="https://www.linkedin.com/in/nishitamatlani"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 text-sm border border-border rounded-full text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            <Linkedin size={16} /> LinkedIn
          </a>
          <a
            href="https://github.com/nishieee"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 text-sm border border-border rounded-full text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            <Github size={16} /> GitHub
          </a>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto mt-24 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="font-serif text-lg text-foreground">
          NM<span className="text-primary">.</span>
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nishita Matlani. Built with care.
        </p>
      </div>
    </section>
  );
};

export default ContactSection;
