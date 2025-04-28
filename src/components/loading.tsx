"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingTextProps {
  text: string;
  dots: string;
}

export function LoadingText({ text, dots }: LoadingTextProps) {
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-muted-foreground w-full text-sm font-medium"
        >
          {text}
          {dots}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
interface LoadingProps {
  messages: string[];
  interval?: number;
  dotCount?: number;
  direction?: "horizontal" | "vertical";
}

export function TextLoader({ messages, interval = 2000, dotCount = 3, direction = "vertical" }: LoadingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= dotCount ? "" : `${prev}.`));
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotInterval);
    };
  }, [messages.length, interval, dotCount]);

  if (direction === "horizontal") {
    return (
      <div className="flex w-full items-center justify-start gap-3 rounded-sm px-3 py-2">
        <div className="min-w-[20px]">
          <motion.div
            className="text-primary-foreground size-5 rounded-full border-[3px] border-t-transparent md:size-6"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear"
            }}
          />
        </div>
        {messages[currentIndex] && <LoadingText text={messages[currentIndex]} dots={dots} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-1">
      <motion.div
        className="text-primary-foreground size-10 rounded-full border-[3px] border-t-transparent md:size-12"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear"
        }}
      />
      {messages[currentIndex] && <LoadingText text={messages[currentIndex]} dots={dots} />}
    </div>
  );
}
