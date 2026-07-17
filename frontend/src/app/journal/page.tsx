"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { PenTool, Calendar, Tag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [dailySummaries, setDailySummaries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [activeTab, setActiveTab] = useState<'custom' | 'daily'>('daily');

  useEffect(() => {
    fetchEntries();
    fetchDailySummaries();
  }, []);

  const fetchEntries = () => {
    api.get("/journal").then(res => setEntries(res.data)).catch(console.error);
  };

  const fetchDailySummaries = () => {
    api.get("/dashboard/daily-summaries").then(res => setDailySummaries(res.data)).catch(console.error);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    try {
      await api.post("/journal", {
        title: newTitle,
        content: newContent,
        category: "Reflection"
      });
      setIsAdding(false);
      setNewTitle("");
      setNewContent("");
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (confirm("Are you sure you want to delete this custom entry?")) {
      try {
        await api.delete(`/journal/${id}`);
        fetchEntries();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteSummary = async (id: number) => {
    if (confirm("Are you sure you want to delete this reflection?")) {
      try {
        await api.delete(`/dashboard/daily-summaries/${id}`);
        fetchDailySummaries();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto w-full">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Decision Journal</h1>
          <p className="text-muted">Reflect on failures, track lessons learned, log decisions.</p>
        </div>
        <button 
          onClick={() => {
            setActiveTab('custom');
            setIsAdding(!isAdding);
          }}
          className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <PenTool className="w-4 h-4" />
          <span>{isAdding ? "Cancel" : "New Entry"}</span>
        </button>
      </header>

      <div className="flex space-x-6 border-b border-border mb-8">
        <button onClick={() => setActiveTab('daily')} className={`pb-2 text-lg font-semibold ${activeTab === 'daily' ? 'border-b-2 border-white text-white' : 'text-muted hover:text-white transition-colors'}`}>Evening Reflections</button>
        <button onClick={() => setActiveTab('custom')} className={`pb-2 text-lg font-semibold ${activeTab === 'custom' ? 'border-b-2 border-white text-white' : 'text-muted hover:text-white transition-colors'}`}>Custom Entries</button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="mb-8 bg-card border border-border rounded-xl p-6"
          >
            <input 
              type="text" 
              placeholder="Entry Title" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-transparent border-b border-border mb-4 py-2 text-xl focus:outline-none focus:border-white transition-colors"
            />
            <textarea 
              placeholder="Write your reflection here..." 
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full bg-transparent border border-border rounded-lg mb-4 p-4 min-h-[150px] focus:outline-none focus:border-white transition-colors"
            />
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-500 transition-colors">
                Save Entry
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {activeTab === 'custom' ? (
          entries.length === 0 ? (
            <div className="text-center text-muted p-10 bg-card border border-border rounded-xl">
              Your custom journal is empty. Write your first entry.
            </div>
          ) : (
            entries.map((entry: any) => (
              <div key={entry.id} className="bg-card border border-border rounded-xl p-8 hover:border-white/20 transition-colors group relative">
                <button 
                  onClick={() => handleDeleteEntry(entry.id)} 
                  className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-4 text-xs font-medium text-muted mb-4">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{entry.date}</span>
                  </span>
                  <span className="flex items-center space-x-1 bg-white/10 text-white px-2 py-0.5 rounded-full">
                    <Tag className="w-3 h-3" />
                    <span>{entry.category}</span>
                  </span>
                </div>
                <h2 className="text-2xl font-semibold mb-4">{entry.title}</h2>
                <div className="prose prose-invert max-w-none text-muted whitespace-pre-wrap">
                  {entry.content}
                </div>
              </div>
            ))
          )
        ) : (
          dailySummaries.length === 0 ? (
            <div className="text-center text-muted p-10 bg-card border border-border rounded-xl">
              No daily reflections yet. Complete your first Evening Reflection on the Dashboard!
            </div>
          ) : (
            dailySummaries.map((summary: any) => (
              <div key={summary.id} className="bg-card border border-border rounded-xl p-8 hover:border-white/20 transition-colors group relative">
                <button 
                  onClick={() => handleDeleteSummary(summary.id)} 
                  className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-4 text-xs font-medium text-muted mb-6">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-semibold text-white text-base">{summary.date}</span>
                  </span>
                  {summary.rating && (
                    <span className="flex items-center space-x-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                      <span>Rating: {summary.rating}/5</span>
                    </span>
                  )}
                  {summary.focus_score && (
                    <span className="flex items-center space-x-1 bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                      <span>Focus: {summary.focus_score}/10</span>
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-indigo-400 font-bold mb-2">Finished Today</h3>
                    <div className="bg-black border border-border rounded-lg p-4 text-sm text-muted whitespace-pre-wrap min-h-[80px]">
                      {summary.finished_today || "Nothing recorded."}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-red-400 font-bold mb-2">Blockers</h3>
                    <div className="bg-black border border-border rounded-lg p-4 text-sm text-muted whitespace-pre-wrap min-h-[80px]">
                      {summary.blocked_by || "No blockers."}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm uppercase tracking-widest text-green-400 font-bold mb-2">Tomorrow's ONE Thing</h3>
                    <div className="bg-black border border-border rounded-lg p-4 text-sm text-white font-medium whitespace-pre-wrap">
                      {summary.tomorrow_plan || "Not set."}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
