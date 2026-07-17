"use client";

import { useState } from "react";
import api from "@/store/api";
import { Brain, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Mentor() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello Commander. I am your Senior Product Designer and AI Mentor. I specialize in European Master's admissions strategy. What is our current roadblock?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await api.post("/mentor/chat", {
        message: userMsg,
        history: messages
      });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "assistant", content: "Error connecting to AI core." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto w-full pt-10 pb-6 px-6">
      <header className="mb-6 flex-shrink-0 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">AI Mentor</h1>
        <p className="text-sm text-muted">Strategic guidance, 24/7.</p>
      </header>

      <div className="flex-grow overflow-y-auto space-y-6 mb-6 pr-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start space-x-4 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "assistant" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-white/10 text-white border border-white/20"
              }`}>
                {msg.role === "assistant" ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-card border border-border text-gray-200"
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-4">
               <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-card border border-border text-muted flex space-x-1 items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your mentor anything..."
            className="w-full bg-card border border-border rounded-full py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-white/30 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 w-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-xs text-muted mt-3">
          AI Mentor can make mistakes. Verify critical deadlines yourself.
        </p>
      </div>
    </div>
  );
}
