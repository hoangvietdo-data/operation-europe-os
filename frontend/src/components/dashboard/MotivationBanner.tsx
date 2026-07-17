"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/store/api";

export default function MotivationBanner() {
  const [quote, setQuote] = useState<{text: string, author: string} | null>(null);

  const fetchQuote = () => {
    api.get("/dashboard/quotes/random").then(res => setQuote(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchQuote();
    const interval = setInterval(fetchQuote, 5 * 60 * 1000); // Rotate every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (!quote) return null;

  return (
    <div className="w-full flex justify-center mb-8 overflow-hidden h-16 items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-lg font-medium text-white/90 italic">"{quote.text}"</p>
          <p className="text-xs text-muted mt-1 uppercase tracking-widest">— {quote.author}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
