import { useState } from "react";
import { X, UploadCloud, Link as LinkIcon, Clock, Tag } from "lucide-react";
import api from "@/store/api";

export default function SubmitEvidenceModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    time_spent_minutes: 60,
    github_link: "",
    portfolio_link: ""
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/skills/evidence", formData);
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
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold">Log Learning Evidence</h2>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">What did you learn or build?</label>
            <input required type="text" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white" 
              placeholder="e.g., Completed React Hooks tutorial"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Details & Proof</label>
            <textarea required className="w-full bg-black border border-white/10 rounded-lg p-3 text-white h-24" 
              placeholder="Describe what you learned in detail. The AI will extract skills from this."
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1 flex items-center gap-1"><Tag className="w-3 h-3"/> Category (Optional)</label>
              <input type="text" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white" 
                placeholder="e.g. Frontend"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Time Spent (mins)</label>
              <input type="number" min="0" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white" 
                value={formData.time_spent_minutes} onChange={e => setFormData({...formData, time_spent_minutes: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> GitHub Link</label>
              <input type="url" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white" 
                placeholder="https://github.com/..."
                value={formData.github_link} onChange={e => setFormData({...formData, github_link: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Portfolio Link</label>
              <input type="url" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white" 
                placeholder="https://..."
                value={formData.portfolio_link} onChange={e => setFormData({...formData, portfolio_link: e.target.value})} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors mt-4">
            {loading ? <span className="animate-pulse">AI Analyzing...</span> : <>
              <UploadCloud className="w-5 h-5" />
              <span>Submit Evidence</span>
            </>}
          </button>
          {loading && <p className="text-xs text-center text-muted mt-2">The AI is extracting skills from your submission...</p>}
        </form>
      </div>
    </div>
  )
}
