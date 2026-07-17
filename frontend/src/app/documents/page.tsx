"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { FileText, Upload, Plus, X, CheckCircle2, AlertCircle, Clock, AlertTriangle, ExternalLink, Trash2, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DOCUMENT_TYPES = [
  "Passport", "Transcript", "CV", "SOP", "IELTS Certificate", "TOEFL Certificate",
  "Recommendation Letter", "Portfolio", "Birth Certificate", "Research Proposal",
  "Financial Statement", "Language Certificate", "Diploma", "Other"
];

const REQUIRED_DOCS = [
  { type: "Passport", label: "Valid Passport Scan" },
  { type: "Transcript", label: "Academic Transcript" },
  { type: "CV", label: "Curriculum Vitae" },
  { type: "SOP", label: "Statement of Purpose" },
  { type: "IELTS Certificate", label: "English Test Score" },
  { type: "Recommendation Letter", label: "Recommendation Letter (×2)" },
];

const TYPE_ICONS: Record<string, string> = {
  "Passport": "🪪", "Transcript": "📋", "CV": "📄", "SOP": "✍️",
  "IELTS Certificate": "🎓", "TOEFL Certificate": "🎓", "Recommendation Letter": "💌",
  "Portfolio": "🖼️", "Financial Statement": "💰", "Research Proposal": "🔬",
  "Language Certificate": "🌐", "Diploma": "🏆", "Other": "📎",
};

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const d = new Date(expiryDate);
  return Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

function AddDocumentModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: "", type: DOCUMENT_TYPES[0], file_path: "", expiry_date: "", status: "Uploaded" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/documents", {
        ...form,
        expiry_date: form.expiry_date || null,
        file_path: form.file_path || null,
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
          <h2 className="text-xl font-bold">Add Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Document Name *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="e.g. IELTS Score Report" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Document Type *</label>
            <select required value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white">
              {DOCUMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">File URL / Link (optional)</label>
            <input value={form.file_path} onChange={e => setForm({...form, file_path: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" placeholder="https://drive.google.com/..." />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Expiry Date (optional)</label>
            <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              className="w-full bg-black border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-white">
              <option>Uploaded</option><option>Missing</option><option>Expired</option><option>Draft</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Add Document"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const fetchDocuments = () => {
    api.get("/documents").then(res => setDocuments(res.data)).catch(console.error);
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    try { await api.delete(`/documents/${id}`); fetchDocuments(); } catch (e) { console.error(e); }
  };

  // Figure out which required docs are missing
  const uploadedTypes = new Set(documents.filter(d => d.status === "Uploaded").map((d: any) => d.type));
  const missingDocs = REQUIRED_DOCS.filter(r => {
    if (r.type === "Recommendation Letter") {
      const count = documents.filter((d: any) => d.type === "Recommendation Letter" && d.status === "Uploaded").length;
      return count < 2;
    }
    return !uploadedTypes.has(r.type);
  });

  const expiringDocs = documents.filter((d: any) => {
    const days = getDaysUntilExpiry(d.expiry_date);
    return days !== null && days >= 0 && days <= 60;
  });

  const uploadedCount = documents.filter((d: any) => d.status === "Uploaded").length;
  const completeness = REQUIRED_DOCS.length > 0
    ? Math.round(((REQUIRED_DOCS.length - missingDocs.length) / REQUIRED_DOCS.length) * 100)
    : 100;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full min-h-screen">
      <AnimatePresence>{isAdding && <AddDocumentModal onClose={() => setIsAdding(false)} onSave={fetchDocuments} />}</AnimatePresence>

      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Document Hub</h1>
          <p className="text-muted">Centralized, secure storage for your application portfolio.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>Add Document</span>
        </button>
      </header>

      {/* Portfolio Completeness */}
      <div className="mb-6 bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-lg">Portfolio Completeness</p>
            <p className="text-sm text-muted">{uploadedCount} documents uploaded · {missingDocs.length} critical items missing</p>
          </div>
          <p className="text-3xl font-bold">{completeness}%</p>
        </div>
        <div className="h-2 bg-black rounded-full overflow-hidden border border-border">
          <motion.div initial={{ width: 0 }} animate={{ width: `${completeness}%` }} transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${completeness === 100 ? 'bg-green-500' : completeness > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* Expiry Warning */}
      {expiringDocs.length > 0 && (
        <div className="mb-6 bg-yellow-950/20 border border-yellow-900/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
            <div>
              <p className="font-semibold text-yellow-400 text-sm">Documents expiring soon</p>
              <p className="text-xs text-yellow-400/70">{expiringDocs.map((d: any) => `${d.name} (${getDaysUntilExpiry(d.expiry_date)}d)`).join(", ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Missing Docs Alert */}
      {missingDocs.length > 0 && (
        <div className="mb-8 bg-red-950/20 border border-red-900/50 rounded-xl p-5">
          <div className="flex items-start space-x-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-400 mb-1">Missing Critical Documents</p>
              <p className="text-xs text-red-400/70">These are required for most European scholarship applications:</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            {missingDocs.map(d => (
              <button key={d.type} onClick={() => setIsAdding(true)}
                className="flex items-center space-x-1.5 text-xs px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-300 hover:bg-red-500/20 transition-colors">
                <Plus className="w-3 h-3" /><span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {documents.length === 0 ? (
          <div className="col-span-full text-center p-16 bg-card border border-border rounded-2xl">
            <FolderOpen className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No documents yet</p>
            <p className="text-muted text-sm mb-6">Start building your application portfolio by adding your first document.</p>
            <button onClick={() => setIsAdding(true)} className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm">Add First Document</button>
          </div>
        ) : (
          documents.map((doc: any) => {
            const expiryDays = getDaysUntilExpiry(doc.expiry_date);
            const isExpiring = expiryDays !== null && expiryDays >= 0 && expiryDays <= 60;
            const isExpired = expiryDays !== null && expiryDays < 0;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-card border rounded-2xl p-6 relative group hover:border-white/20 transition-all ${isExpired ? 'border-red-900/50' : isExpiring ? 'border-yellow-900/50' : 'border-border'}`}>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{TYPE_ICONS[doc.type] || "📎"}</div>
                  <div className="flex items-center space-x-2">
                    {doc.status === "Uploaded" && !isExpired
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : isExpired ? <AlertCircle className="w-5 h-5 text-red-500" />
                      : <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  </div>
                </div>

                <h3 className="font-semibold text-base mb-1 leading-tight">{doc.name}</h3>
                <p className="text-xs text-muted mb-3">{doc.type}</p>

                {isExpired && <p className="text-xs text-red-400 font-medium mb-2">⚠ Expired</p>}
                {isExpiring && !isExpired && <p className="text-xs text-yellow-400 font-medium mb-2">⏰ Expires in {expiryDays} days</p>}

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${doc.status === "Uploaded" && !isExpired ? "bg-green-500/10 text-green-400" : doc.status === "Missing" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                    {isExpired ? "Expired" : doc.status}
                  </span>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.file_path && (
                      <a href={doc.file_path} target="_blank" rel="noreferrer" className="text-muted hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(doc.id)} className="text-muted hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
