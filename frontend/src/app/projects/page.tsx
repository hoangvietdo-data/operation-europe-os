"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { Folder, Plus, Github, ExternalLink, X, Edit2, Trash2, BarChart2, Trophy, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROJECT_TAGS = ["AI/ML", "Web Dev", "Research", "Mobile", "Data Science", "Open Source", "Design", "Leadership", "Community"];

const TAG_COLORS: Record<string, string> = {
  "AI/ML": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Web Dev": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Research": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Mobile": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Data Science": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Open Source": "bg-green-500/20 text-green-400 border-green-500/30",
  "Design": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Leadership": "bg-red-500/20 text-red-400 border-red-500/30",
  "Community": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

function ProjectModal({ project, onClose, onSave }: { project?: any; onClose: () => void; onSave: () => void }) {
  const isEdit = !!project;
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    progress_percentage: project?.progress_percentage || 0,
    url: project?.url || "",
    reflection: project?.reflection || "",
    impact: project?.impact || "",
    metrics: project?.metrics || "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(project?.metrics?.split(",").filter(Boolean) || []);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, metrics: selectedTags.join(",") };
      if (isEdit) await api.put(`/projects/${project.id}`, payload);
      else await api.post("/projects", payload);
      onSave();
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#111]/90 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">{isEdit ? "Edit Project" : "New Project"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Project Name *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. AI Scholarship Matcher" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white h-24 resize-none"
              placeholder="What does this project do? What problem does it solve?" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Tags / Technology</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TAGS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${selectedTags.includes(tag) ? (TAG_COLORS[tag] || 'bg-white/10 text-white border-white/30') : 'border-border text-muted hover:text-white'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Progress ({form.progress_percentage}%)</label>
            <input type="range" min="0" max="100" value={form.progress_percentage} onChange={e => setForm({...form, progress_percentage: parseInt(e.target.value)})}
              className="w-full" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Project URL / GitHub</label>
            <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Impact / Results</label>
            <input value={form.impact} onChange={e => setForm({...form, impact: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. Helped 200+ users, 95% accuracy..." />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Reflection / What you learned</label>
            <textarea value={form.reflection} onChange={e => setForm({...form, reflection: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white h-20 resize-none"
              placeholder="Key learnings, challenges overcome..." />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const fetchProjects = () => {
    api.get("/projects").then(res => setProjects(res.data)).catch(console.error);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.progress_percentage || 0), 0) / projects.length) : 0;
  const completedCount = projects.filter(p => p.progress_percentage === 100).length;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <AnimatePresence>
        {isAdding && <ProjectModal onClose={() => setIsAdding(false)} onSave={fetchProjects} />}
        {editing && <ProjectModal project={editing} onClose={() => setEditing(null)} onSave={fetchProjects} />}
      </AnimatePresence>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Project Tracker</h1>
          <p className="text-muted">Your portfolio of projects — each one strengthening your scholarship application.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>New Project</span>
        </button>
      </div>

      {/* Stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Total Projects</p>
            <p className="text-3xl font-bold">{projects.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-400">{completedCount}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">Avg Progress</p>
            <p className="text-3xl font-bold">{avgProgress}%</p>
          </div>
        </div>
      )}

      {/* Portfolio Tip */}
      {projects.length < 2 && (
        <div className="mb-8 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-400">Build a stronger portfolio</p>
            <p className="text-xs text-indigo-400/70">Scholarship committees look for at least 2-3 significant projects. Add your real-world projects, open-source contributions, or research work to boost your Profile score.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-card border border-border rounded-2xl">
            <Folder className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No projects yet</p>
            <p className="text-muted text-sm mb-6">Add your GitHub projects, research work, or leadership initiatives to show scholarship committees what you're capable of.</p>
            <button onClick={() => setIsAdding(true)} className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm">Add First Project</button>
          </div>
        ) : (
          projects.map((p: any) => {
            const tags = (p.metrics || "").split(",").filter(Boolean);
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all group relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditing(p)} className="p-1.5 text-muted hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-muted hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="p-1.5 text-muted hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1.5 leading-tight">{p.name}</h3>
                <p className="text-sm text-muted mb-3 flex-grow line-clamp-2">{p.description}</p>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tags.map((tag: string) => (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${TAG_COLORS[tag] || 'bg-white/5 text-muted border-border'}`}>{tag}</span>
                    ))}
                  </div>
                )}

                {p.impact && (
                  <div className="mb-4 bg-green-500/5 border border-green-500/10 rounded-lg p-3">
                    <p className="text-xs text-green-400 flex items-center gap-1 mb-1"><Trophy className="w-3 h-3" /> Impact</p>
                    <p className="text-xs text-muted">{p.impact}</p>
                  </div>
                )}

                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Progress</span>
                    <span className={`font-bold ${p.progress_percentage === 100 ? 'text-green-400' : ''}`}>{p.progress_percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-border">
                    <div className={`h-full rounded-full transition-all duration-1000 ${p.progress_percentage === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                      style={{ width: `${p.progress_percentage}%` }} />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
