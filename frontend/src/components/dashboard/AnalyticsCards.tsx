"use client";
import { useEffect, useState } from "react";
import api from "@/store/api";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Flame, Clock, Trophy, Target, ArrowRight } from "lucide-react";
import ReadinessModal from "./ReadinessModal";

export default function AnalyticsCards({ xpTrigger }: { xpTrigger: number }) {
  const [totalXP, setTotalXP] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReadiness = () => {
    api.get("/dashboard/readiness").then(res => {
      setReadinessData(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    api.get("/dashboard/xp").then(res => {
      const total = res.data.reduce((acc: number, log: any) => acc + log.amount, 0);
      setTotalXP(total);
    });
    api.get("/dashboard/study-sessions").then(res => {
      setSessions(res.data);
    });
    fetchReadiness();
  }, [xpTrigger]);

  const handleRefreshAI = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.post("/dashboard/readiness/refresh");
      setReadinessData(res.data);
      // Also trigger sidebar update
      window.dispatchEvent(new Event("rpg_update"));
    } catch (err) {
      console.error("Failed to refresh AI", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalStudyMinutes = sessions.reduce((acc: number, s: any) => acc + s.duration_minutes, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Calculate Streak based on unique study session dates (mock simple streak)
  const uniqueDates = new Set(sessions.map((s: any) => s.date));
  const streak = uniqueDates.size;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">Total XP</p>
          <Trophy className="w-4 h-4 text-yellow-500" />
        </div>
        <div>
          <p className="text-3xl font-bold">{totalXP}</p>
          <p className="text-xs text-green-500 mt-1">+Level 4 Candidate</p>
        </div>
      </div>
      
      <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">Focus Hours</p>
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="text-3xl font-bold">{totalStudyHours}h</p>
          <p className="text-xs text-muted mt-1">This month</p>
        </div>
      </div>

      <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">Daily Streak</p>
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <p className="text-3xl font-bold">{streak}</p>
          <p className="text-xs text-muted mt-1">Days in a row</p>
        </div>
      </div>

      <div className="bg-card border border-border p-5 rounded-xl flex flex-col justify-between relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4 relative z-10">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">AI Readiness</p>
          <Target className="w-4 h-4 text-purple-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-end space-x-2 mb-1">
            <p className="text-3xl font-bold">{readinessData ? readinessData.overall : 0}%</p>
          </div>
          {readinessData?.next_action && (
            <p className="text-xs text-purple-400 mt-1 truncate">
              {readinessData.next_action.title}
              {readinessData.next_action.impact > 0 && ` (+${readinessData.next_action.impact}%)`}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md flex-1 flex items-center justify-center space-x-1 transition-colors"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button 
              onClick={handleRefreshAI}
              disabled={isRefreshing}
              className="text-xs font-medium bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
              title="Recalculate AI Assessment"
            >
              {isRefreshing ? "..." : "Refresh"}
            </button>
          </div>
        </div>
        
        {/* Subtle AI glow background */}
        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <ReadinessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={readinessData} 
        onRefresh={handleRefreshAI}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
