"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function Heading({ text }: { text: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <h2
      ref={ref}
      className="text-primary text-center text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
    >
      {text.split("").map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.2, delay: index * 0.1 }}
        >
          {letter}
        </motion.span>
      ))}
    </h2>
  );
}
