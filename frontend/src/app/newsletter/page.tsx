"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { Mail, ArrowRight, Calendar, Sparkles, Trash2, Globe, Clock, Lightbulb, AlertTriangle, BookOpen, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["All", "New Opportunity", "Deadline Alert", "Tips & Strategy", "Country Update"];

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  "New Opportunity": { icon: <Globe className="w-3 h-3" />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  "Deadline Alert": { icon: <AlertTriangle className="w-3 h-3" />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  "Tips & Strategy": { icon: <Lightbulb className="w-3 h-3" />, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  "Country Update": { icon: <Globe className="w-3 h-3" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  "AI Curated": { icon: <Sparkles className="w-3 h-3" />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
};

export default function Newsletter() {
  const [news, setNews] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [isFetching, setIsFetching] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  const fetchNews = () => {
    api.get("/news").then(res => setNews(res.data)).catch(console.error);
  };

  useEffect(() => { fetchNews(); }, []);

  const handleFetchAI = async () => {
    setIsFetching(true);
    try {
      await api.post("/news/fetch-ai");
      fetchNews();
    } catch (err) { console.error(err); }
    finally { setIsFetching(false); }
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/news/${id}`);
    fetchNews();
  };

  const toggleBookmark = (id: number) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = news.filter((n: any) => {
    if (filter === "All") return true;
    if (filter === "New Opportunity") return n.source?.toLowerCase().includes("opportunity") || n.headline?.toLowerCase().includes("new") || n.source === "AI Curated";
    return n.source === filter || n.category === filter;
  });

  const categoryCounts: Record<string, number> = {};
  CATEGORIES.slice(1).forEach(cat => {
    categoryCounts[cat] = news.filter((n: any) => n.category === cat || n.source === cat).length;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto w-full min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Scholarship Radar</h1>
          <p className="text-muted">AI-curated intelligence on European scholarships — deadlines, tips, and new opportunities.</p>
        </div>
        <button onClick={handleFetchAI} disabled={isFetching}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-60 shadow-lg shadow-purple-500/20">
          {isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isFetching ? "AI Scanning..." : "Fetch Latest"}</span>
        </button>
      </div>

      {/* AI Loading indicator */}
      <AnimatePresence>
        {isFetching && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
            <div>
              <p className="text-sm font-semibold text-purple-400">AI is scanning scholarship news...</p>
              <p className="text-xs text-purple-400/70">Searching for deadlines, new opportunities, and strategies relevant to your profile.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${filter === cat ? 'bg-white text-black border-white' : 'bg-card border-border text-muted hover:text-white hover:border-white/30'}`}>
            {cat} {cat !== "All" && categoryCounts[cat] > 0 && <span className="ml-1 opacity-60">({categoryCounts[cat]})</span>}
          </button>
        ))}
      </div>

      {/* News Feed */}
      {news.length === 0 ? (
        <div className="text-center p-16 bg-card border border-border rounded-2xl">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
            <Mail className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-lg font-semibold mb-2">No news yet</p>
          <p className="text-muted text-sm mb-6">Click "Fetch Latest" to let AI scan for scholarship news relevant to your profile.</p>
          <button onClick={handleFetchAI} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center space-x-2 mx-auto">
            <Sparkles className="w-4 h-4" /><span>Fetch Latest News</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item: any, idx: number) => {
            const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES["AI Curated"];
            const isBookmarked = bookmarks.has(item.id);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-white/20 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {item.category && (
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${catStyle.bg} ${catStyle.color}`}>
                          {catStyle.icon}
                          {item.category}
                        </span>
                      )}
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.date_published}
                      </span>
                      <span className="text-xs font-medium text-indigo-400">{item.source}</span>
                    </div>
                    <h2 className="text-lg font-bold mb-2 group-hover:text-white/90 transition-colors leading-snug">{item.headline}</h2>
                    <p className="text-sm text-muted leading-relaxed line-clamp-3">{item.summary}</p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 shrink-0">
                    <button onClick={() => toggleBookmark(item.id)}
                      className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-yellow-400 bg-yellow-500/10' : 'text-muted hover:text-white hover:bg-white/10'}`}
                      title={isBookmarked ? "Bookmarked" : "Bookmark"}>
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-full text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="p-2 rounded-full text-muted hover:text-white hover:bg-white/10 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
