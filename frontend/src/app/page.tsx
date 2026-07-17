"use client";

import { useState, useEffect } from "react";
import { Plus, Target, Compass, BookOpen } from "lucide-react";
import MotivationBanner from "@/components/dashboard/MotivationBanner";
import StudyTimer from "@/components/dashboard/StudyTimer";
import TaskManager from "@/components/dashboard/TaskManager";
import AnalyticsCards from "@/components/dashboard/AnalyticsCards";
import EveningReflection from "@/components/dashboard/EveningReflection";
import IdentityFocusCard from "@/components/dashboard/IdentityFocusCard";
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
          <button onClick={() => window.location.href = '/roadmap'} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-colors">
            <Compass className="w-4 h-4" />
            <span>Roadmap</span>
          </button>
          <button onClick={() => document.getElementById('task-input')?.focus()} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </header>

      <AnalyticsCards xpTrigger={xpTrigger} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          <IdentityFocusCard mission={mission} />

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
