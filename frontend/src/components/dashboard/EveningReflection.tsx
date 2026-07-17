"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/store/api";
import { Moon, Star } from "lucide-react";

export default function EveningReflection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [summary, setSummary] = useState({ finished_today: "", blocked_by: "", tomorrow_plan: "", rating: 5 });

  useEffect(() => {
    // Check if it's past 7 PM
    const hour = new Date().getHours();
    if (hour >= 19) {
      // Check if already submitted today
      api.get("/dashboard/daily-summary/today").then(res => {
        if (!res.data.finished_today) {
          setIsVisible(true);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/dashboard/daily-summary", summary);
      setIsCompleted(true);
      setTimeout(() => setIsVisible(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-card border border-border max-w-lg w-full rounded-2xl p-8 relative overflow-hidden"
        >
          {isCompleted ? (
            <div className="text-center py-10">
              <Moon className="w-16 h-16 mx-auto mb-6 text-indigo-400" />
              <h2 className="text-2xl font-semibold mb-2">Great work today.</h2>
              <p className="text-muted">Rest well. Tomorrow is a new battle.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center space-x-3 mb-8">
                <Moon className="w-6 h-6 text-indigo-400" />
                <h2 className="text-2xl font-semibold">Evening Reflection</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">What did you finish today?</label>
                  <textarea required value={summary.finished_today} onChange={e => setSummary({...summary, finished_today: e.target.value})} className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white h-24" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">What blocked you?</label>
                  <input type="text" value={summary.blocked_by} onChange={e => setSummary({...summary, blocked_by: e.target.value})} className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">What is the ONE thing to do tomorrow?</label>
                  <input required type="text" value={summary.tomorrow_plan} onChange={e => setSummary({...summary, tomorrow_plan: e.target.value})} className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rate your focus (1-10)</label>
                  <div className="flex items-center space-x-2">
                    <input type="range" min="1" max="10" value={summary.rating} onChange={e => setSummary({...summary, rating: parseInt(e.target.value)})} className="flex-1" />
                    <span className="font-bold w-6 text-center">{summary.rating}</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-white text-black py-3 rounded-lg font-medium mt-8 hover:bg-gray-200 transition-colors">
                Save & Rest
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
