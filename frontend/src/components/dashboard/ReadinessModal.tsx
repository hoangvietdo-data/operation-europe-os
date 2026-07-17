"use client";
import { X, CheckCircle2, Circle, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ReadinessModal({ 
  isOpen, 
  onClose, 
  data, 
  onRefresh, 
  isRefreshing 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  data: any,
  onRefresh?: () => void,
  isRefreshing?: boolean
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#111]/90 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-start z-20">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              AI Scholarship Readiness
            </h2>
            <p className="text-muted text-sm">Overall Assessment Score: <span className="text-white font-bold">{data?.overall ?? 0}%</span></p>
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button 
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-full transition-colors disabled:opacity-50"
                title="Recalculate Readiness"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Next Action */}
          {data?.next_action && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-purple-400 font-bold mb-1">Highest Impact Next Action</p>
                <p className="text-lg font-semibold text-white">{data.next_action.title}</p>
              </div>
              {data.next_action.impact > 0 && (
                <div className="bg-purple-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  +{data.next_action.impact}%
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-sm uppercase tracking-wider text-muted font-semibold mb-4">Detailed Breakdown</h3>
            
            {!data?.categories?.length ? (
              <div className="text-center p-8 border border-white/10 rounded-xl text-muted">
                No data available. Please click Refresh to run the AI assessment.
              </div>
            ) : (
              <div className="space-y-4">
                {data.categories.map((cat: any, idx: number) => {
                  const isExpanded = expandedCategory === cat.name;
                  return (
                    <div 
                      key={idx} 
                      className={`border ${isExpanded ? 'border-purple-500/50 bg-white/5' : 'border-white/10 bg-transparent'} rounded-xl overflow-hidden transition-all duration-300`}
                    >
                      {/* Summary Row */}
                      <button 
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                        className="w-full p-4 flex flex-col hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-center w-full mb-2">
                          <div className="flex items-center space-x-3">
                            {cat.progress >= 100 ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted flex-shrink-0" />
                            )}
                            <span className="font-semibold text-white text-left">{cat.name}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-bold">{Math.round(cat.progress)}%</p>
                              {cat.estimated_gain > 0 && !isExpanded && (
                                <p className="text-[10px] text-purple-400 font-medium">Potential: +{cat.estimated_gain}%</p>
                              )}
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                          </div>
                        </div>
                        
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${cat.progress >= 100 ? 'bg-green-500' : 'bg-purple-500'}`}
                            style={{ width: `${cat.progress}%` }}
                          />
                        </div>
                      </button>

                      {/* Expanded Panel */}
                      {isExpanded && (
                        <div className="p-4 border-t border-white/5 bg-black/20 text-sm space-y-4">
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#111] p-3 rounded-lg border border-white/5">
                              <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Target / Goal</p>
                              <p className="text-white font-medium">{cat.target}</p>
                            </div>
                            <div className="bg-[#111] p-3 rounded-lg border border-white/5">
                              <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">AI Confidence</p>
                              <div className="flex items-center space-x-2">
                                <span className={`font-medium ${cat.confidence_score > 70 ? 'text-green-400' : cat.confidence_score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {cat.confidence_score}%
                                </span>
                                <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-current rounded-full" style={{ width: `${cat.confidence_score}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg">
                            <p className="text-xs text-purple-400 mb-1 uppercase tracking-wider font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> AI Reasoning
                            </p>
                            <p className="text-white/90 leading-relaxed">{cat.ai_reasoning}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted mb-2 uppercase tracking-wider font-semibold">Evidence Used</p>
                              {cat.evidence_used?.length > 0 ? (
                                <ul className="space-y-1">
                                  {cat.evidence_used.map((ev: string, i: number) => (
                                    <li key={i} className="flex items-start space-x-2">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-white/80">{ev}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-white/40 italic">No concrete evidence found.</p>
                              )}
                            </div>
                            
                            <div>
                              <p className="text-xs text-red-400/80 mb-2 uppercase tracking-wider font-semibold">Missing / Next Steps</p>
                              {cat.missing ? (
                                <div className="space-y-2">
                                  <div className="flex items-start space-x-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-red-200/90">{cat.missing}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs border border-white/5 bg-white/5 rounded px-2 py-1">
                                    <span className="text-muted">Est. Effort: <span className="text-white">{cat.estimated_effort}</span></span>
                                    <span className="text-purple-400 font-semibold">+{cat.estimated_gain}%</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-green-400 italic">Requirements met!</p>
                              )}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
