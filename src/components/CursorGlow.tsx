import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CursorGlow = () => {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 150, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 150, damping: 20, mass: 0.4 });

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 100);
      y.set(e.clientY - 100);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed top-0 left-0 w-[200px] h-[200px] rounded-full z-[55] mix-blend-multiply dark:mix-blend-screen"
    >
      <div className="w-full h-full rounded-full bg-primary/10 blur-2xl" />
    </motion.div>
  );
};

export default CursorGlow;
