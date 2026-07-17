"use client";

import { useState, useEffect } from "react";
import { Plus, Target, Compass, BookOpen } from "lucide-react";
import MotivationBanner from "@/components/dashboard/MotivationBanner";
import StudyTimer from "@/components/dashboard/StudyTimer";
import TaskManager from "@/components/dashboard/TaskManager";
import AnalyticsCards from "@/components/dashboard/AnalyticsCards";
import EveningReflection from "@/components/dashboard/EveningReflection";
import { useAuth } from "@/context/AuthContext";
import api from "@/store/api";

export default function Dashboard() {
  const [xpTrigger, setXpTrigger] = useState(0);
  const [mission, setMission] = useState<any>(null);
  const { logout } = useAuth();

  useEffect(() => {
    // Fetch the primary active mission
    api.get("/missions").then(res => {
      const active = res.data.find((m: any) => m.status === "Active");
      if (active) setMission(active);
    }).catch(console.error);
  }, []);

  const triggerXpUpdate = (amount: number) => {
    setXpTrigger(prev => prev + amount);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full min-h-screen pb-20">
      <EveningReflection />
      
      <MotivationBanner />

      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Mission Control</h1>
          <p className="text-muted">Command center for your Master's journey.</p>
        </div>
        
        <div className="flex space-x-3">
          <button onClick={logout} className="flex items-center space-x-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-red-500/20">
            <span>Log out</span>
          </button>
          <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-colors">
            <Compass className="w-4 h-4" />
            <span>Roadmap</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </header>

      <AnalyticsCards xpTrigger={xpTrigger} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Focus */}
          <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-32 h-32" />
            </div>
            
            <h2 className="text-sm uppercase tracking-widest text-indigo-400 font-bold mb-4">Today's Focus</h2>
            
            {mission ? (
              <>
                <h3 className="text-3xl font-bold mb-2 w-3/4">{mission.title}</h3>
                <p className="text-muted mb-6 w-3/4">{mission.description}</p>
                <div className="flex space-x-6 items-center">
                  <div>
                    <p className="text-xs text-muted mb-1">Progress</p>
                    <p className="font-bold text-xl">{mission.progress}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Impact</p>
                    <p className="font-bold text-xl">{mission.impact}</p>
                  </div>
                  <button className="ml-auto bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                    Start Mission
                  </button>
                </div>
              </>
            ) : (
              <div className="py-6">
                <h3 className="text-2xl font-bold mb-2">No Active Mission</h3>
                <p className="text-muted mb-6">Select a mission from your roadmap to set today's focus.</p>
                <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                  View Roadmap
                </button>
              </div>
            )}
          </div>

          <div className="h-[400px]">
            <TaskManager onXP={triggerXpUpdate} />
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <StudyTimer onXP={triggerXpUpdate} />
          
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-muted" />
              <span>Quick Resources</span>
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg bg-black border border-border hover:border-white/30 transition-colors text-sm">
                View IELTS Materials
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-black border border-border hover:border-white/30 transition-colors text-sm">
                Draft Motivation Letter
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-black border border-border hover:border-white/30 transition-colors text-sm">
                Open AI Mentor
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
