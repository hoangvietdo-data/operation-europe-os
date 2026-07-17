import { Sparkles, Activity } from "lucide-react";

export default function SkillCard({ skill }: { skill: any }) {
  const xpMax = 100;
  const xpPercent = Math.min(100, Math.max(0, (skill.xp / xpMax) * 100));
  
  return (
    <div className="bg-card border border-border p-5 rounded-xl hover:border-white/20 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-white text-lg">{skill.name}</h3>
        <span className="text-xs font-semibold bg-white/10 text-white px-2 py-1 rounded">Lv {skill.level}</span>
      </div>
      <p className="text-xs text-muted mb-4 uppercase tracking-wider">{skill.category}</p>
      
      <div className="space-y-4">
        {/* XP Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted">XP Progress</span>
            <span className="text-blue-400 font-medium">{skill.xp} / {xpMax}</span>
          </div>
          <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Confidence Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-500"/> Confidence</span>
            <span className="text-yellow-500 font-medium">{skill.confidence}%</span>
          </div>
          <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
              style={{ width: `${skill.confidence}%` }}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center text-[11px] text-muted pt-2 border-t border-border">
          <div className="flex items-center gap-1"><Activity className="w-3 h-3"/> {skill.total_evidence} Evidences</div>
          <div>Updated {new Date(skill.last_updated).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  )
}
