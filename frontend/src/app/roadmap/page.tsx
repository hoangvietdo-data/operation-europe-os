"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { Compass, CheckCircle2, Lock, Clock, ArrowRight, Plus, Star, Zap, Play, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PHASES = ["Preparation", "Application", "Waiting", "Admitted"];

const PHASE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  "Preparation": { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-blue-500/20" },
  "Application": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", glow: "shadow-purple-500/20" },
  "Waiting": { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", glow: "shadow-yellow-500/20" },
  "Admitted": { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", glow: "shadow-green-500/20" },
};

const STATUS_ORDER = ["Locked", "Available", "In Progress", "Completed"];

function NodeStatusBadge({ status }: { status: string }) {
  const map: Record<string, JSX.Element> = {
    "Completed": <span className="flex items-center gap-1 text-xs font-semibold text-green-400"><CheckCircle2 className="w-3.5 h-3.5" />Done</span>,
    "In Progress": <span className="flex items-center gap-1 text-xs font-semibold text-blue-400"><Clock className="w-3.5 h-3.5" />In Progress</span>,
    "Available": <span className="flex items-center gap-1 text-xs font-semibold text-white"><ArrowRight className="w-3.5 h-3.5" />Available</span>,
    "Locked": <span className="flex items-center gap-1 text-xs font-semibold text-muted"><Lock className="w-3.5 h-3.5" />Locked</span>,
  };
  return map[status] || map["Locked"];
}

function AddNodeModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", type: PHASES[0], estimated_hours: 5, difficulty: "Medium", reward_xp: 100, status: "Available" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/roadmap/nodes", form);
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
          <h2 className="text-xl font-bold">Add Roadmap Node</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. Achieve IELTS 7.5" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white h-20 resize-none" placeholder="What does completing this milestone require?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Phase</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white">
                {PHASES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Initial Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white">
                {STATUS_ORDER.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Estimated Hours</label>
              <input type="number" value={form.estimated_hours} onChange={e => setForm({...form, estimated_hours: parseInt(e.target.value)})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">XP Reward</label>
              <input type="number" value={form.reward_xp} onChange={e => setForm({...form, reward_xp: parseInt(e.target.value)})}
                className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white">
              <option>Easy</option><option>Medium</option><option>Hard</option><option>Expert</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Add Node"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Roadmap() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchNodes = () => {
    api.get("/roadmap/nodes").then(res => setNodes(res.data)).catch(console.error);
  };

  useEffect(() => { fetchNodes(); }, []);

  const advanceStatus = async (node: any) => {
    const nextIdx = STATUS_ORDER.indexOf(node.status) + 1;
    if (nextIdx >= STATUS_ORDER.length) return;
    setUpdatingId(node.id);
    try {
      await api.put(`/roadmap/nodes/${node.id}`, { ...node, status: STATUS_ORDER[nextIdx] });
      if (STATUS_ORDER[nextIdx] === "Completed") {
        await api.post("/dashboard/xp", { amount: node.reward_xp || 100, reason: `Completed: ${node.title}` });
        window.dispatchEvent(new Event("rpg_update"));
      }
      fetchNodes();
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  // Find the best "next action" node to highlight
  const nextAction = nodes.find(n => n.status === "Available") || nodes.find(n => n.status === "In Progress");

  const completedCount = nodes.filter(n => n.status === "Completed").length;
  const totalCount = nodes.length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const nodesByPhase: Record<string, any[]> = {};
  PHASES.forEach(p => { nodesByPhase[p] = nodes.filter(n => n.type === p); });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen">
      <AnimatePresence>{isAdding && <AddNodeModal onClose={() => setIsAdding(false)} onSave={fetchNodes} />}</AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Strategic Roadmap</h1>
          <p className="text-muted">Your path from today to scholarship acceptance — step by step.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Add Milestone</span>
        </button>
      </div>

      {/* Overall Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-8 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-lg">{overallProgress}% Complete</p>
              <p className="text-sm text-muted">{completedCount} of {totalCount} milestones achieved</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Total XP Available</p>
              <p className="text-xl font-bold text-yellow-400">{nodes.reduce((sum, n) => sum + (n.reward_xp || 0), 0)} XP</p>
            </div>
          </div>
          <div className="h-3 bg-black rounded-full overflow-hidden border border-border">
            <motion.div initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full" />
          </div>
        </div>
      )}

      {/* AI Next Step Banner */}
      {nextAction && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-1">🎯 Recommended Next Step</p>
              <p className="font-bold text-lg text-white">{nextAction.title}</p>
              <p className="text-sm text-muted">{nextAction.estimated_hours}h estimated · {nextAction.reward_xp} XP reward · {nextAction.difficulty} difficulty</p>
            </div>
          </div>
          <button onClick={() => advanceStatus(nextAction)} disabled={updatingId === nextAction.id}
            className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 shrink-0">
            <Play className="w-4 h-4" />
            <span>{nextAction.status === "In Progress" ? "Mark Done" : "Start Now"}</span>
          </button>
        </motion.div>
      )}

      {/* Kanban Phases */}
      {nodes.length === 0 ? (
        <div className="text-center p-16 bg-card border border-border rounded-2xl">
          <Compass className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Your roadmap is empty</p>
          <p className="text-muted text-sm mb-6">Add milestones to start mapping your path to scholarship success.</p>
          <button onClick={() => setIsAdding(true)} className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm">Add First Milestone</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PHASES.map(phase => {
            const phaseNodes = nodesByPhase[phase] || [];
            const colors = PHASE_COLORS[phase];
            const phaseCompleted = phaseNodes.filter(n => n.status === "Completed").length;
            return (
              <div key={phase} className="flex flex-col">
                <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${colors.bg} border ${colors.border}`}>
                  <h2 className={`font-bold text-sm uppercase tracking-wider ${colors.text}`}>{phase}</h2>
                  <span className={`text-xs font-medium ${colors.text}`}>{phaseCompleted}/{phaseNodes.length}</span>
                </div>

                <div className="space-y-3 flex-1">
                  {phaseNodes.length === 0 ? (
                    <p className="text-xs text-muted text-center py-6 border border-dashed border-border rounded-xl">No milestones yet</p>
                  ) : (
                    phaseNodes.map((node, idx) => {
                      const isExpanded = expandedId === node.id;
                      const isLocked = node.status === "Locked";
                      const isUpdating = updatingId === node.id;
                      return (
                        <motion.div key={node.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          className={`bg-card border rounded-xl overflow-hidden transition-all ${node.status === "Completed" ? "border-green-500/30 bg-green-500/5" : node.status === "In Progress" ? "border-blue-500/30" : node.status === "Available" ? "border-white/20" : "border-border opacity-60"} ${!isLocked ? "cursor-pointer hover:border-white/30" : "cursor-default"}`}
                          onClick={() => !isLocked && setExpandedId(isExpanded ? null : node.id)}>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <NodeStatusBadge status={node.status} />
                              <span className="text-xs text-yellow-400 font-medium">{node.reward_xp} XP</span>
                            </div>
                            <p className={`font-semibold text-sm leading-tight mb-1 ${node.status === "Completed" ? "line-through text-muted" : ""}`}>{node.title}</p>
                            <p className="text-xs text-muted">~{node.estimated_hours}h · {node.difficulty}</p>
                          </div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                                className="overflow-hidden border-t border-border bg-black/30">
                                <div className="p-4 space-y-3">
                                  {node.description && <p className="text-xs text-muted leading-relaxed">{node.description}</p>}
                                  {node.status !== "Locked" && node.status !== "Completed" && (
                                    <button onClick={(e) => { e.stopPropagation(); advanceStatus(node); }} disabled={isUpdating}
                                      className="w-full bg-white text-black py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
                                      {isUpdating ? "Updating..." : node.status === "In Progress" ? "✓ Mark as Completed" : "▶ Start This Milestone"}
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
