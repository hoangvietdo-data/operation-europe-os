import { useState } from "react";
import { X, UploadCloud, Link as LinkIcon, Clock, BookOpen } from "lucide-react";
import api from "@/store/api";

export default function SubmitRecordModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    learning_type: "Course",
    time_spent: 60,
    difficulty: "Medium",
    reflection: "",
    github_link: "",
    portfolio_link: ""
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/genome/record", formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111] z-10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5"/> Log Learning Record</h2>
            <p className="text-xs text-muted">The AI will extract domains, skills, and concepts from this.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Title</label>
            <input required type="text" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-white/30 transition-colors" 
              placeholder="e.g., Read Thinking, Fast and Slow"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Description (Be Detailed)</label>
            <textarea required className="w-full bg-black border border-white/10 rounded-lg p-3 text-white h-24 focus:border-white/30 transition-colors" 
              placeholder="What did you learn? Mention specific keywords, frameworks, or concepts."
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Learning Type</label>
              <select className="w-full bg-black border border-white/10 rounded-lg p-3 text-white"
                value={formData.learning_type} onChange={e => setFormData({...formData, learning_type: e.target.value})}>
                <option>Book</option>
                <option>Course</option>
                <option>Project</option>
                <option>Internship</option>
                <option>Certificate</option>
                <option>Research</option>
                <option>Work</option>
                <option>Practice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Difficulty</label>
              <select className="w-full bg-black border border-white/10 rounded-lg p-3 text-white"
                value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Time (Mins)</label>
              <input type="number" min="0" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white" 
                value={formData.time_spent} onChange={e => setFormData({...formData, time_spent: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Reflection (Optional)</label>
            <textarea className="w-full bg-black border border-white/10 rounded-lg p-3 text-white h-20" 
              placeholder="How did this change your way of thinking?"
              value={formData.reflection} onChange={e => setFormData({...formData, reflection: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> GitHub Repo (Optional)</label>
              <input type="url" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white" 
                value={formData.github_link} onChange={e => setFormData({...formData, github_link: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> External Link (Optional)</label>
              <input type="url" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white" 
                value={formData.portfolio_link} onChange={e => setFormData({...formData, portfolio_link: e.target.value})} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-4 rounded-xl flex items-center justify-center space-x-2 transition-all mt-6 shadow-lg shadow-blue-900/20">
            {loading ? <span className="animate-pulse">AI is expanding your Genome...</span> : <>
              <UploadCloud className="w-5 h-5" />
              <span>Submit & Analyze</span>
            </>}
          </button>
        </form>
      </div>
    </div>
  )
}
