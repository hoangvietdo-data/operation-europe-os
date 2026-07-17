"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { BookOpen, Plus, X, ExternalLink, Tag, Trash2, Search, Lightbulb, GraduationCap, Globe, FileText, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const KNOWLEDGE_CATEGORIES = ["All", "IELTS & Language", "SOP & Writing", "Scholarship Guides", "Country Guides", "Research Tips", "Career Planning", "Other"];

const CAT_ICONS: Record<string, React.ReactNode> = {
  "IELTS & Language": <GraduationCap className="w-4 h-4" />,
  "SOP & Writing": <FileText className="w-4 h-4" />,
  "Scholarship Guides": <Zap className="w-4 h-4" />,
  "Country Guides": <Globe className="w-4 h-4" />,
  "Research Tips": <Lightbulb className="w-4 h-4" />,
  "Other": <BookOpen className="w-4 h-4" />,
};

const PINNED_RESOURCES = [
  { title: "DAAD Scholarship Finder", url: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/", tag: "Scholarship Guides", icon: "🇩🇪" },
  { title: "Erasmus+ Opportunities Portal", url: "https://erasmus-plus.ec.europa.eu/", tag: "Scholarship Guides", icon: "🇪🇺" },
  { title: "IELTS Band Descriptors Official", url: "https://www.ielts.org/teaching-and-research/score-descriptors", tag: "IELTS & Language", icon: "📚" },
  { title: "SOP Writing Guide (MIT)", url: "https://mitcommlab.mit.edu/broad/commkit/statement-of-purpose/", tag: "SOP & Writing", icon: "✍️" },
];

function SaveResourceModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ title: "", url: "", notes: "", tags: "Other" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/knowledge", form);
      onSave();
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold">Save Resource</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. DAAD Scholarship Database" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">URL</label>
            <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Category</label>
            <select value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white">
              {KNOWLEDGE_CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white h-20 resize-none"
              placeholder="Why is this resource useful? Key takeaways?" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Save Resource"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Knowledge() {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const fetchItems = () => {
    api.get("/knowledge").then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: number) => {
    await api.delete(`/knowledge/${id}`).then(fetchItems).catch(console.error);
  };

  const filtered = items.filter((item: any) => {
    const matchCat = activeCategory === "All" || item.tags === activeCategory;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.notes?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <AnimatePresence>{isAdding && <SaveResourceModal onClose={() => setIsAdding(false)} onSave={fetchItems} />}</AnimatePresence>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Knowledge Base</h1>
          <p className="text-muted">Your personal library of scholarship guides, strategies, and useful resources.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Save Resource</span>
        </button>
      </div>

      {/* AI Recommendation Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-1">Recommended Next Read</p>
            <p className="font-bold text-white">How to write a winning SOP for European scholarships</p>
            <p className="text-xs text-muted">Pinned resource · 15 min read · High impact for SOP category</p>
          </div>
        </div>
        <button onClick={() => setIsAdding(true)} className="text-xs text-indigo-400 hover:text-white transition-colors border border-indigo-500/30 px-3 py-2 rounded-lg">Save it</button>
      </div>

      {/* Pinned Essential Resources */}
      <div className="mb-8">
        <h2 className="text-sm uppercase tracking-wider text-muted font-semibold mb-4">📌 Essential Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PINNED_RESOURCES.map(r => (
            <a key={r.title} href={r.url} target="_blank" rel="noreferrer"
              className="bg-card border border-border rounded-xl p-4 hover:border-white/20 transition-all group flex items-center space-x-3">
              <span className="text-2xl">{r.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-white transition-colors">{r.title}</p>
                <p className="text-xs text-muted">{r.tag}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors" />
        </div>
        <div className="flex flex-wrap gap-2">
          {KNOWLEDGE_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${activeCategory === cat ? 'bg-white text-black border-white' : 'border-border text-muted hover:text-white hover:border-white/30'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-card border border-border rounded-2xl">
            <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No resources saved yet</p>
            <p className="text-muted text-sm mb-6">Save articles, guides, and links that help you prepare a stronger scholarship application.</p>
            <button onClick={() => setIsAdding(true)} className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm">Save First Resource</button>
          </div>
        ) : (
          filtered.map((item: any) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  {CAT_ICONS[item.tags] || <BookOpen className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="p-1.5 text-muted hover:text-white"><ExternalLink className="w-4 h-4" /></a>}
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-base mb-2 line-clamp-2 leading-snug">{item.title}</h3>
              {item.notes && <p className="text-sm text-muted mb-4 flex-grow line-clamp-3">{item.notes}</p>}
              <div className="pt-4 border-t border-border">
                <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">{item.tags || "Other"}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
