"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { Trophy, Plus, X, Calendar, Edit2, Trash2, Star, Zap, Medal, Award, Target, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Pre-defined badge challenges — unlockable based on profile actions
const BADGE_CHALLENGES = [
  { id: "first_project", title: "Builder", description: "Add your first project", icon: "🔨", xp: 200, category: "Portfolio" },
  { id: "three_projects", title: "Portfolio Creator", description: "Add 3 or more projects", icon: "🖼️", xp: 500, category: "Portfolio" },
  { id: "first_scholarship", title: "Hunter", description: "Add your first scholarship", icon: "🎯", xp: 150, category: "Application" },
  { id: "submitted_app", title: "Applicant", description: "Submit your first application", icon: "📬", xp: 1000, category: "Application" },
  { id: "ielts_target", title: "Language Master", description: "Set an IELTS target in settings", icon: "📚", xp: 100, category: "English" },
  { id: "first_achievement", title: "Achiever", description: "Log your first achievement", icon: "🏆", xp: 200, category: "Milestones" },
  { id: "first_journal", title: "Reflector", description: "Write your first journal entry", icon: "✍️", xp: 100, category: "Habits" },
  { id: "first_document", title: "Organized", description: "Upload your first document", icon: "📋", xp: 150, category: "Documents" },
  { id: "seven_day_streak", title: "Disciplined", description: "Study for 7 consecutive days", icon: "🔥", xp: 750, category: "Habits" },
  { id: "first_roadmap", title: "Strategist", description: "Add your first roadmap milestone", icon: "🗺️", xp: 200, category: "Planning" },
];

function LogAchievementModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", date_earned: new Date().toISOString().split("T")[0], reflection: "", evidence_file_path: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/achievements", { ...form, evidence_file_path: form.evidence_file_path || null });
      await api.post("/dashboard/xp", { amount: 300, reason: `Achievement logged: ${form.title}` });
      window.dispatchEvent(new Event("rpg_update"));
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
          <h2 className="text-xl font-bold">Log Achievement</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Achievement Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. Scored IELTS 7.5, Won hackathon..." />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white h-20 resize-none"
              placeholder="What did you accomplish? Provide context." />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Date Earned</label>
            <input type="date" value={form.date_earned} onChange={e => setForm({...form, date_earned: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Evidence URL (optional)</label>
            <input value={form.evidence_file_path} onChange={e => setForm({...form, evidence_file_path: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="https://drive.google.com/... or certificate link" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Reflection</label>
            <textarea value={form.reflection} onChange={e => setForm({...form, reflection: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white h-20 resize-none"
              placeholder="What did you learn? How does this strengthen your profile?" />
          </div>
          <p className="text-xs text-yellow-400 font-medium">+300 XP will be awarded for logging this achievement!</p>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Log Achievement (+300 XP)"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"achievements" | "badges">("achievements");

  const fetchAchievements = () => {
    api.get("/achievements").then(res => setAchievements(res.data)).catch(console.error);
  };

  useEffect(() => { fetchAchievements(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this achievement?")) return;
    await api.delete ? api.delete(`/achievements/${id}`).then(fetchAchievements).catch(console.error) : null;
  };

  // Determine which badge challenges are (mock) unlocked based on achievements count
  const unlockedBadges = new Set<string>();
  if (achievements.length >= 1) unlockedBadges.add("first_achievement");

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <AnimatePresence>{isAdding && <LogAchievementModal onClose={() => setIsAdding(false)} onSave={fetchAchievements} />}</AnimatePresence>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Trophy Cabinet</h1>
          <p className="text-muted">Every achievement builds your story. Tell it well.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Log Achievement</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Total Logged</p>
          <p className="text-3xl font-bold">{achievements.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Badges Earned</p>
          <p className="text-3xl font-bold text-yellow-400">{unlockedBadges.size}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">XP from Achievements</p>
          <p className="text-3xl font-bold text-purple-400">{achievements.length * 300}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-1 bg-card border border-border rounded-xl p-1 mb-8 w-fit">
        <button onClick={() => setActiveTab("achievements")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "achievements" ? "bg-white text-black" : "text-muted hover:text-white"}`}>
          Achievements
        </button>
        <button onClick={() => setActiveTab("badges")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 ${activeTab === "badges" ? "bg-white text-black" : "text-muted hover:text-white"}`}>
          <span>Challenge Badges</span>
          <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full">{unlockedBadges.size}/{BADGE_CHALLENGES.length}</span>
        </button>
      </div>

      {activeTab === "achievements" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {achievements.length === 0 ? (
            <div className="col-span-full text-center p-16 bg-card border border-border rounded-2xl">
              <Trophy className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No achievements yet</p>
              <p className="text-muted text-sm mb-6">Log a real milestone — IELTS score, hackathon win, research paper, volunteer work — anything that tells your story.</p>
              <button onClick={() => setIsAdding(true)} className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm">Log First Achievement</button>
            </div>
          ) : (
            achievements.map((a: any, idx: number) => (
              <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Trophy className="w-24 h-24 text-yellow-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {a.evidence_file_path && (
                        <a href={a.evidence_file_path} target="_blank" rel="noreferrer" className="p-1.5 text-muted hover:text-white rounded"><ChevronRight className="w-4 h-4" /></a>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{a.title}</h3>
                  {a.description && <p className="text-sm text-muted mb-3 line-clamp-2">{a.description}</p>}
                  {a.reflection && (
                    <div className="mb-3 bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-muted italic">"{a.reflection}"</p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted flex items-center gap-1"><Calendar className="w-3 h-3" />{a.date_earned || "Recently"}</span>
                    <span className="text-xs text-yellow-400 font-semibold">+300 XP</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {BADGE_CHALLENGES.map((badge, idx) => {
            const isUnlocked = unlockedBadges.has(badge.id);
            return (
              <motion.div key={badge.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                className={`p-5 rounded-2xl border transition-all ${isUnlocked ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-border bg-card opacity-70'}`}>
                <div className="flex items-start space-x-4">
                  <div className={`text-3xl p-2 rounded-xl ${isUnlocked ? 'bg-yellow-500/10' : 'bg-white/5 grayscale opacity-50'}`}>{badge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-muted'}`}>{badge.title}</h3>
                      {isUnlocked && <span className="text-xs text-yellow-400 font-semibold">Unlocked ✓</span>}
                    </div>
                    <p className="text-xs text-muted mt-1">{badge.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted px-2 py-0.5 bg-white/5 rounded-full">{badge.category}</span>
                      <span className={`text-xs font-semibold ${isUnlocked ? 'text-yellow-400' : 'text-muted'}`}>+{badge.xp} XP</span>
                    </div>
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
