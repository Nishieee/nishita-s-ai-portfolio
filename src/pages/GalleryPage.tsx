import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { Link } from "react-router-dom";

// Placeholder gallery items — replace src with your own images!
const photos = [
  { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", caption: "food adventures 🍜", tag: "food" },
  { src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80", caption: "wanderlust ✈️", tag: "travel" },
  { src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", caption: "café hunting ☕", tag: "café" },
  { src: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80", caption: "sweet tooth 🍰", tag: "food" },
  { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", caption: "beach days 🌊", tag: "travel" },
  { src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80", caption: "cozy corner 💕", tag: "café" },
  { src: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80", caption: "brunch o'clock 🥞", tag: "food" },
  { src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80", caption: "road trips 🚗", tag: "travel" },
  { src: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&q=80", caption: "latte art ☕", tag: "café" },
];

const tags = ["all", "food", "travel", "café"];

const GalleryPage = () => {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = filter === "all" ? photos : photos.filter((p) => p.tag === filter);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
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
          className="mb-10"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-primary mb-3">Gallery</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
            Snapshots of life<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mb-8">
            Cozy cafés, food adventures, and travel memories — a little peek into what I love outside of code 💕
          </p>

          {/* Filter tags */}
          <div className="flex gap-2 flex-wrap">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground hover:bg-primary/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Masonry-style grid */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((photo, i) => (
              <motion.div
                key={photo.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setSelected(i)}
              >
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-end">
                    <span className="text-primary-foreground text-sm font-medium px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {photo.caption}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <button
              className="absolute top-6 right-6 text-foreground hover:text-primary transition-colors"
              onClick={() => setSelected(null)}
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={filtered[selected]?.src}
              alt={filtered[selected]?.caption}
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
            <p className="absolute bottom-8 text-center text-foreground font-serif text-lg">
              {filtered[selected]?.caption}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
