"use client";
import { useState, useEffect } from "react";
import api from "@/store/api";
import { CheckCircle2, Circle, GripVertical, Plus, BrainCircuit, Trash2, Edit2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function TaskManager({ onXP }: { onXP: (amount: number) => void }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    api.get("/dashboard/tasks").then(res => setTasks(res.data)).catch(console.error);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask) return;
    try {
      await api.post("/dashboard/tasks", { title: newTask });
      setNewTask("");
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTask = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/dashboard/tasks/${id}`, { is_completed: !currentStatus });
      fetchTasks();
      
      if (!currentStatus) {
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
        await api.post("/dashboard/xp", { amount: 50, reason: "Task Completed" });
        onXP(50);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateAITasks = async () => {
    setIsAiLoading(true);
    // Simulate AI generation based on roadmap context
    setTimeout(async () => {
      const aiTasks = [
        "Review IELTS Writing Task 2 structure (45m)",
        "Draft first paragraph of Motivation Letter",
        "Search DAAD database for matching Engineering programs"
      ];
      for (const t of aiTasks) {
        await api.post("/dashboard/tasks", { title: t, category: "AI Suggested", priority: "High" });
      }
      fetchTasks();
      setIsAiLoading(false);
    }, 2000);
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/dashboard/tasks/${id}`);
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (task: any) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (id: number) => {
    if (!editTitle.trim()) return;
    try {
      await api.put(`/dashboard/tasks/${id}`, { title: editTitle });
      setEditingTaskId(null);
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter(t => activeTab === 'active' ? !t.is_completed : t.is_completed);

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-6">
          <button onClick={() => setActiveTab('active')} className={`text-lg font-semibold ${activeTab === 'active' ? 'text-white' : 'text-muted hover:text-white transition-colors'}`}>Tasks</button>
          <button onClick={() => setActiveTab('history')} className={`text-lg font-semibold ${activeTab === 'history' ? 'text-white' : 'text-muted hover:text-white transition-colors'}`}>History</button>
        </div>
        <button onClick={generateAITasks} disabled={isAiLoading} className="flex items-center space-x-1 text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 transition-colors">
          <BrainCircuit className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
          <span>{isAiLoading ? 'Analyzing...' : 'AI Suggest'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-4">
        {filteredTasks.length === 0 && (
          <p className="text-sm text-muted text-center py-4">No tasks found.</p>
        )}
        {filteredTasks.map(t => (
          <div key={t.id} className={`flex items-center p-3 rounded-lg border group ${t.is_completed ? 'border-border/50 bg-black/50 opacity-80' : 'border-border bg-black'}`}>
            <GripVertical className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 cursor-grab mr-2" />
            <button onClick={() => toggleTask(t.id, t.is_completed)} className="mr-3 text-muted hover:text-white transition-colors">
              {t.is_completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5" />}
            </button>
            <div className="flex-1">
              {editingTaskId === t.id ? (
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => saveEdit(t.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(t.id)}
                  autoFocus
                  className="w-full bg-transparent border-b border-white/30 focus:outline-none focus:border-white text-sm"
                />
              ) : (
                <>
                  <p className={`text-sm ${t.is_completed ? 'line-through text-white/50' : ''}`}>{t.title}</p>
                  {t.category && <span className="text-[10px] uppercase text-indigo-400 mt-1">{t.category}</span>}
                </>
              )}
            </div>
            {t.priority === 'High' && !t.is_completed && <div className="w-2 h-2 rounded-full bg-red-500 ml-2" />}
            <div className="flex space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(t)} className="text-muted hover:text-blue-400">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteTask(t.id)} className="text-muted hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTask} className="flex items-center relative mt-auto">
        <Plus className="w-4 h-4 text-muted absolute left-3" />
        <input 
          type="text" 
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add a manual task..." 
          className="w-full bg-black border border-border rounded-lg pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
        />
      </form>
    </div>
  );
}
