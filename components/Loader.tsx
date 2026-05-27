"use client";

import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-400 rounded-full"
          animate={{
            y: ["0%", "-50%", "0%"],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
