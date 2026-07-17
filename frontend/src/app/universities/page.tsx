"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { Building, Plus, X, ExternalLink, MapPin, BarChart2, Trash2, Star, DollarSign, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COUNTRY_FLAGS: Record<string, string> = {
  "Germany": "🇩🇪", "France": "🇫🇷", "Netherlands": "🇳🇱", "Sweden": "🇸🇪",
  "Norway": "🇳🇴", "Denmark": "🇩🇰", "Finland": "🇫🇮", "UK": "🇬🇧",
  "Switzerland": "🇨🇭", "Austria": "🇦🇹", "Belgium": "🇧🇪", "Italy": "🇮🇹",
  "Spain": "🇪🇸", "USA": "🇺🇸", "Japan": "🇯🇵", "Australia": "🇦🇺",
};

function AddUniversityModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: "", country: "", city: "", ranking: "", living_cost: "", programs: "", official_link: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/universities", {
        ...form,
        ranking: form.ranking ? parseInt(form.ranking) : null,
        living_cost: form.living_cost ? parseFloat(form.living_cost) : null,
      });
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
          <h2 className="text-xl font-bold">Add University</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">University Name *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. Technical University of Munich" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Country *</label>
              <input required value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. Germany" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">City</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. Munich" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">World Ranking</label>
              <input type="number" value={form.ranking} onChange={e => setForm({...form, ranking: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. 50" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Living Cost (€/month)</label>
              <input type="number" value={form.living_cost} onChange={e => setForm({...form, living_cost: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. 900" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Programs of Interest</label>
            <input value={form.programs} onChange={e => setForm({...form, programs: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. M.Sc. Computer Science, AI, Data Science" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Official Website</label>
            <input value={form.official_link} onChange={e => setForm({...form, official_link: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="https://..." />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Add University"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Universities() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUniversities = () => {
    api.get("/universities").then(res => setUniversities(res.data)).catch(console.error);
  };

  useEffect(() => { fetchUniversities(); }, []);

  const filtered = universities.filter((u: any) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.country.toLowerCase().includes(search.toLowerCase())
  );

  const avgRanking = universities.filter(u => u.ranking).length > 0
    ? Math.round(universities.filter(u => u.ranking).reduce((s, u) => s + u.ranking, 0) / universities.filter(u => u.ranking).length)
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <AnimatePresence>{isAdding && <AddUniversityModal onClose={() => setIsAdding(false)} onSave={fetchUniversities} />}</AnimatePresence>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">University Tracker</h1>
          <p className="text-muted">Research and track universities that match your goals and profile.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Add University</span>
        </button>
      </div>

      {/* Stats */}
      {universities.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Tracking</p>
            <p className="text-3xl font-bold">{universities.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Countries</p>
            <p className="text-3xl font-bold">{new Set(universities.map((u: any) => u.country)).size}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Avg Ranking</p>
            <p className="text-3xl font-bold text-blue-400">#{avgRanking || "—"}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or country..."
          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-card border border-border rounded-2xl">
            <Building className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No universities tracked yet</p>
            <p className="text-muted text-sm mb-6">Add target universities to research their programs, costs, and match them with your scholarship opportunities.</p>
            <button onClick={() => setIsAdding(true)} className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm">Add First University</button>
          </div>
        ) : (
          filtered.map((u: any) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-white/20 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{COUNTRY_FLAGS[u.country] || "🏫"}</span>
                  <div>
                    <p className="text-xs text-muted">{u.city ? `${u.city}, ` : ""}{u.country}</p>
                    {u.ranking && <p className="text-xs text-blue-400 font-semibold">#{u.ranking} World</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {u.official_link && (
                    <a href={u.official_link} target="_blank" rel="noreferrer" className="p-1.5 text-muted hover:text-white">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2 leading-tight">{u.name}</h3>

              {u.programs && (
                <p className="text-xs text-muted mb-4 line-clamp-2">{u.programs}</p>
              )}

              {u.living_cost && (
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">€{u.living_cost}/month</span>
                  <span className="text-xs text-muted">living cost</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
