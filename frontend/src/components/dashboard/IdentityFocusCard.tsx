"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Zap, Brain, ChevronRight, Target } from "lucide-react";
import api from "@/store/api";

export default function IdentityFocusCard({ mission }: { mission: any }) {
  const [rpgData, setRpgData] = useState<any>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load RPG Data
    api.get("/rpg/profile").then(res => setRpgData(res.data)).catch(console.error);
    // Mock streak fetching (since backend has mock streak in analytics)
    api.get("/analytics").then(res => setStreak(res.data.streak || 18)).catch(() => setStreak(18));

    const handleRpgUpdate = () => {
      api.get("/rpg/profile").then(res => setRpgData(res.data)).catch(console.error);
    };
    window.addEventListener("rpg_update", handleRpgUpdate);
    return () => window.removeEventListener("rpg_update", handleRpgUpdate);
  }, []);

  const calculateXpProgress = () => {
    if (!rpgData || rpgData.next_level_xp === undefined || rpgData.current_level_xp === undefined) return 0;
    const progress = ((rpgData.xp - rpgData.current_level_xp) / (rpgData.next_level_xp - rpgData.current_level_xp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const badges = [
    { id: 1, icon: Trophy, label: "Consistency", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", description: "Completed 7 days in a row" },
    { id: 2, icon: Zap, label: "Deep Work", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", description: "Logged 10 hours of focused study" },
    { id: 3, icon: Brain, label: "Strategic Thinker", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", description: "Unlocked 5 knowledge nodes" },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 min-h-[320px]">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

      {/* Left: Mission / Focus */}
      <div className="flex-1 flex flex-col justify-center z-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-bold mb-6 flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>Today's Focus</span>
        </h2>
        
        {mission ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-semibold tracking-tight text-white mb-3 leading-tight">{mission.title}</h3>
              <p className="text-muted max-w-md text-sm leading-relaxed">{mission.description}</p>
            </div>
            
            <div className="flex space-x-8 items-center pt-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">Progress</p>
                <p className="font-medium text-xl text-white">{mission.progress}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">Impact</p>
                <p className="font-medium text-xl text-white">{mission.impact}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <button className="bg-white text-black px-8 py-3 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Start Mission
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-semibold tracking-tight text-white mb-3">No Active Mission</h3>
              <p className="text-muted max-w-md text-sm leading-relaxed">
                Your character is ready. Select today's mission from your roadmap to continue your journey.
              </p>
            </div>
            
            <div className="pt-2">
              <button 
                onClick={() => window.location.href = '/roadmap'}
                className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-xl font-medium text-sm hover:bg-white/20 transition-colors backdrop-blur-md"
              >
                Choose Mission
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Personal Identity Panel */}
      <div className="w-full md:w-80 shrink-0 z-10">
        <div className="h-full rounded-2xl bg-black/40 border border-white/5 p-6 backdrop-blur-xl flex flex-col justify-between relative group">
          {/* Rank Section */}
          <div 
            className="cursor-pointer" 
            onClick={() => window.location.href = '/achievements/frames'}
          >
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium">Current Rank</p>
              <ChevronRight className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline space-x-2">
              <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {rpgData?.current_title || "Initiate"}
              </h4>
              <span className="text-sm font-medium text-indigo-400">Lv.{rpgData?.level || 1}</span>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-6 mb-6">
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium">XP Progress</p>
              <span className="text-xs font-medium text-gray-300">
                {rpgData ? `${rpgData.xp} / ${rpgData.next_level_xp}` : "0 / 100"} XP
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${calculateXpProgress()}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 mb-6 border border-white/5">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1">Current Streak</p>
              <div className="flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-sm">{streak} Days</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1">Next Evolution</p>
              <span className="font-medium text-sm text-gray-300">Strategist</span>
            </div>
          </div>

          {/* Badges */}
          <div>
            <div className="flex space-x-2">
              {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    onClick={() => window.location.href = '/achievements'}
                    className={`relative group/badge cursor-pointer p-2 rounded-xl border ${badge.border} ${badge.bg} hover:scale-105 transition-all duration-300`}
                  >
                    <Icon className={`w-5 h-5 ${badge.color}`} />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                      <div className="bg-gray-900 border border-border text-white text-[10px] rounded-lg p-2 shadow-xl">
                        <p className="font-bold mb-0.5 text-xs">{badge.label}</p>
                        <p className="text-gray-400 leading-tight">{badge.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
