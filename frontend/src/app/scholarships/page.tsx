"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { Plus, Search, MapPin, Globe, Calendar, Star, ChevronRight, X, CheckCircle2, Clock, AlertTriangle, ArrowRight, ExternalLink, Trash2, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_PIPELINE = ["Researching", "Preparing", "Submitted", "Accepted", "Rejected"];

const STATUS_COLORS: Record<string, string> = {
  "Researching": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Preparing": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Submitted": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Accepted": "bg-green-500/20 text-green-400 border-green-500/30",
  "Rejected": "bg-red-500/20 text-red-400 border-red-500/30",
  "Not Started": "bg-white/5 text-muted border-white/10",
};

const PRIORITY_COLORS: Record<string, string> = {
  "High": "text-red-400",
  "Medium": "text-yellow-400",
  "Low": "text-green-400",
};

const COUNTRY_FLAGS: Record<string, string> = {
  "Germany": "🇩🇪", "France": "🇫🇷", "Netherlands": "🇳🇱", "Sweden": "🇸🇪",
  "Norway": "🇳🇴", "Denmark": "🇩🇰", "Finland": "🇫🇮", "UK": "🇬🇧",
  "Switzerland": "🇨🇭", "Austria": "🇦🇹", "Belgium": "🇧🇪", "Italy": "🇮🇹",
  "Spain": "🇪🇸", "Portugal": "🇵🇹", "Poland": "🇵🇱", "Czech Republic": "🇨🇿",
  "Hungary": "🇭🇺", "Ireland": "🇮🇪", "Luxembourg": "🇱🇺", "USA": "🇺🇸",
  "Japan": "🇯🇵", "South Korea": "🇰🇷", "Australia": "🇦🇺", "Canada": "🇨🇦",
};

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const days = getDaysUntilDeadline(deadline);
  if (days === null) return <span className="text-xs text-muted">No deadline</span>;
  if (days < 0) return <span className="text-xs text-red-500 font-bold">Closed</span>;
  if (days <= 14) return <span className="text-xs font-bold text-red-400 animate-pulse">⚠ {days}d left</span>;
  if (days <= 30) return <span className="text-xs font-medium text-yellow-400">🔔 {days}d left</span>;
  return <span className="text-xs text-muted">{days}d left</span>;
}

function AddScholarshipModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: "", country: "", deadline: "", coverage: "", website: "", priority: "Medium", status: "Researching",
    personal_notes: "", tuition: false, monthly_stipend: "", insurance: false, flight: false, visa: false,
    difficulty: "Medium",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/scholarships", {
        ...form,
        monthly_stipend: form.monthly_stipend ? parseFloat(form.monthly_stipend) : null,
      });
      onSave();
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#111]/90 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">Add Scholarship</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Scholarship Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors" placeholder="e.g. DAAD Scholarship" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Country *</label>
              <input required value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors" placeholder="e.g. Germany" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Coverage</label>
              <input value={form.coverage} onChange={e => setForm({...form, coverage: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors" placeholder="e.g. Full tuition + €861/month" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Monthly Stipend (€)</label>
              <input type="number" value={form.monthly_stipend} onChange={e => setForm({...form, monthly_stipend: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors" placeholder="e.g. 861" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors">
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors">
                {STATUS_PIPELINE.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors">
                <option>Easy</option><option>Medium</option><option>Hard</option><option>Very Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Website</label>
              <input value={form.website} onChange={e => setForm({...form, website: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">Coverage Includes</label>
              <div className="flex flex-wrap gap-3">
                {[["tuition", "Tuition"], ["insurance", "Insurance"], ["flight", "Flight"], ["visa", "Visa"]].map(([key, label]) => (
                  <label key={key} className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${(form as any)[key] ? 'border-white/30 bg-white/10' : 'border-border'}`}>
                    <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm({...form, [key]: e.target.checked})} className="hidden" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Personal Notes</label>
              <textarea value={form.personal_notes} onChange={e => setForm({...form, personal_notes: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors h-24 resize-none"
                placeholder="Requirements, contacts, key notes..." />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Add Scholarship"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ScholarshipDetailPanel({ scholarship, onClose, onUpdate }: { scholarship: any; onClose: () => void; onUpdate: () => void }) {
  const [status, setStatus] = useState(scholarship.status);
  const [notes, setNotes] = useState(scholarship.personal_notes || "");
  const [saving, setSaving] = useState(false);
  const days = getDaysUntilDeadline(scholarship.deadline);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/scholarships/${scholarship.id}`, { ...scholarship, status, personal_notes: notes });
      onUpdate();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this scholarship?")) return;
    await api.delete(`/scholarships/${scholarship.id}`);
    onUpdate();
    onClose();
  };

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-screen w-full max-w-md bg-[#0d0d0d] border-l border-white/10 z-50 flex flex-col shadow-2xl overflow-y-auto">
      <div className="p-6 border-b border-white/10 flex items-start justify-between sticky top-0 bg-[#0d0d0d]/90 backdrop-blur-md z-10">
        <div>
          <p className="text-xs text-muted mb-1">{COUNTRY_FLAGS[scholarship.country] || "🌍"} {scholarship.country}</p>
          <h2 className="text-xl font-bold leading-tight">{scholarship.name}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full ml-4"><X className="w-5 h-5 text-muted" /></button>
      </div>
      <div className="p-6 space-y-6 flex-1">
        {/* Deadline Urgency */}
        {days !== null && days >= 0 && days <= 30 && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">Deadline approaching!</p>
              <p className="text-xs text-red-400/70">Only {days} days left to submit your application.</p>
            </div>
          </div>
        )}

        {/* Coverage Summary */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-3">Coverage</p>
          <p className="font-medium mb-3">{scholarship.coverage || "Not specified"}</p>
          <div className="flex flex-wrap gap-2">
            {scholarship.tuition && <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">✓ Tuition</span>}
            {scholarship.insurance && <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">✓ Insurance</span>}
            {scholarship.flight && <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">✓ Flight</span>}
            {scholarship.visa && <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">✓ Visa</span>}
            {scholarship.monthly_stipend && <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">€{scholarship.monthly_stipend}/month</span>}
          </div>
        </div>

        {/* Status Pipeline */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-3">Application Stage</p>
          <div className="flex items-center">
            {STATUS_PIPELINE.map((s, i) => (
              <div key={s} className="flex items-center">
                <button onClick={() => setStatus(s)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold ${status === s ? 'border-white bg-white text-black scale-110' : STATUS_PIPELINE.indexOf(status) > i ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-border bg-card text-muted'}`}
                  title={s}>
                  {STATUS_PIPELINE.indexOf(status) > i ? "✓" : i + 1}
                </button>
                {i < STATUS_PIPELINE.length - 1 && <div className={`h-0.5 w-6 ${STATUS_PIPELINE.indexOf(status) > i ? 'bg-green-500' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">Current: <span className="text-white font-medium">{status}</span></p>
        </div>

        {/* Personal Notes */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-3">Personal Notes</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white transition-colors h-28 resize-none"
            placeholder="Requirements, important contacts, key deadlines..." />
        </div>

        {/* Next Action Hint */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Suggested Next Step</p>
          <p className="text-sm text-white">
            {status === "Researching" && "Review official requirements and check your eligibility score."}
            {status === "Preparing" && "Draft your SOP and gather all required documents."}
            {status === "Submitted" && "Prepare for potential interview. Monitor your email."}
            {status === "Accepted" && "Congratulations! Start visa application process."}
            {status === "Rejected" && "Analyze what went wrong and strengthen your profile for next cycle."}
            {status === "Not Started" && "Start researching this scholarship's requirements now."}
          </p>
        </div>
      </div>
      <div className="p-6 border-t border-white/10 flex items-center justify-between space-x-3">
        <button onClick={handleDelete} className="p-2 text-muted hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
        <div className="flex space-x-3">
          {scholarship.website && (
            <a href={scholarship.website} target="_blank" rel="noreferrer" className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-sm hover:border-white/30 transition-colors">
              <ExternalLink className="w-4 h-4" /><span>Website</span>
            </a>
          )}
          <button onClick={handleSave} disabled={saving}
            className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchScholarships = () => {
    api.get("/scholarships").then(res => setScholarships(res.data)).catch(console.error);
  };

  useEffect(() => { fetchScholarships(); }, []);

  const filtered = scholarships.filter((s: any) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    const matchPriority = filterPriority === "All" || s.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const urgentCount = scholarships.filter((s: any) => {
    const days = getDaysUntilDeadline(s.deadline);
    return days !== null && days >= 0 && days <= 14;
  }).length;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      {isAdding && <AddScholarshipModal onClose={() => setIsAdding(false)} onSave={fetchScholarships} />}
      <AnimatePresence>{selected && <ScholarshipDetailPanel scholarship={selected} onClose={() => setSelected(null)} onUpdate={fetchScholarships} />}</AnimatePresence>

      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Scholarships</h1>
          <p className="text-muted">Track every opportunity, from research to acceptance.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Add Scholarship</span>
        </button>
      </header>

      {/* Urgency Alert */}
      {urgentCount > 0 && (
        <div className="mb-6 bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300"><span className="font-bold">{urgentCount} scholarship{urgentCount > 1 ? "s" : ""}</span> have deadlines within 14 days. Act now!</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {["All", ...STATUS_PIPELINE].map(s => {
          const count = s === "All" ? scholarships.length : scholarships.filter((x: any) => x.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`p-3 rounded-xl border text-left transition-all ${filterStatus === s ? 'border-white/30 bg-white/10' : 'border-border bg-card hover:border-white/20'}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted mt-0.5">{s}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scholarships..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors" />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors">
          <option value="All">All Priorities</option>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-card border border-border rounded-2xl">
            <Globe className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No scholarships found</p>
            <p className="text-muted text-sm mb-6">Add your first scholarship opportunity to start tracking your journey.</p>
            <button onClick={() => setIsAdding(true)} className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm">Get Started</button>
          </div>
        ) : (
          filtered.map((s: any) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelected(s)}
              className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:border-white/20 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{COUNTRY_FLAGS[s.country] || "🌍"}</span>
                  <div>
                    <p className="text-xs text-muted">{s.country}</p>
                    <span className={`text-xs font-bold ${PRIORITY_COLORS[s.priority] || 'text-muted'}`}>{s.priority} Priority</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[s.status] || STATUS_COLORS["Not Started"]}`}>{s.status}</span>
              </div>

              <h3 className="font-bold text-lg mb-2 group-hover:text-white transition-colors leading-tight">{s.name}</h3>
              {s.coverage && <p className="text-xs text-muted mb-4 line-clamp-2">{s.coverage}</p>}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <DeadlineBadge deadline={s.deadline} />
                <div className="flex items-center space-x-2 text-xs text-muted">
                  {s.tuition && <span title="Tuition">🎓</span>}
                  {s.monthly_stipend && <span title={`€${s.monthly_stipend}/mo`}>💰</span>}
                  {s.flight && <span title="Flight">✈️</span>}
                  {s.visa && <span title="Visa">📋</span>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
