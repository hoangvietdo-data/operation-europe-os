"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, Trophy, Library, GraduationCap, Folder, BookOpen, FileText, Mail, Brain, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: Activity },
  { name: "Roadmap", href: "/roadmap", icon: Compass },
  { name: "Scholarships", href: "/scholarships", icon: Library },
  { name: "Universities", href: "/universities", icon: GraduationCap },
  { name: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Journal", href: "/journal", icon: FileText },
  { name: "Documents", href: "/documents", icon: Folder },
  { name: "Newsletter", href: "/newsletter", icon: Mail },
  { name: "AI Mentor", href: "/mentor", icon: Brain },
  { name: "Settings", href: "/settings", icon: Settings },
];
import { useEffect, useState } from "react";
import api from "@/store/api";
import AvatarFrame from "@/components/ui/AvatarFrame";

// ... existing navItems ...

export function Sidebar() {
  const pathname = usePathname();
  const [rpgData, setRpgData] = useState<any>(null);
  const [readinessData, setReadinessData] = useState<any>(null);

  const loadRpgData = () => {
    api.get("/rpg/profile").then(res => setRpgData(res.data)).catch(console.error);
    api.get("/dashboard/readiness").then(res => setReadinessData(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadRpgData();
    window.addEventListener("rpg_update", loadRpgData);
    return () => window.removeEventListener("rpg_update", loadRpgData);
  }, []);

  return (
    <aside className="w-64 border-r border-border bg-sidebar h-screen sticky top-0 flex flex-col pt-6 text-sm">
      <div className="px-6 mb-8 flex items-center space-x-2">
        <Activity className="w-5 h-5 text-white" />
        <span className="font-semibold text-white tracking-tight">OpEurope OS</span>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors relative group ${
                isActive ? "text-white bg-white/10" : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-white rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto pb-4 pt-4 border-t border-border/50">
        <div className="p-3 bg-card rounded-lg border border-border mb-4">
          <p className="text-xs text-muted mb-1">Scholarship Readiness</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">{readinessData ? readinessData.overall : 0}%</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-1000" 
              style={{ width: `${readinessData ? readinessData.overall : 0}%` }}
            />
          </div>
        </div>
        
        {/* User RPG Profile at the bottom */}
        {rpgData ? (
          <div 
            onClick={() => window.location.href = '/achievements/frames'}
            className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors -mx-2"
          >
            <AvatarFrame 
              tier={rpgData.current_frame} 
              size={48} 
              level={rpgData.level} 
              imageUrl={rpgData.avatar_url || "https://github.com/shadcn.png"}
              xpProgress={
                rpgData.next_level_xp && rpgData.current_level_xp !== undefined
                  ? (rpgData.xp - rpgData.current_level_xp) / (rpgData.next_level_xp - rpgData.current_level_xp)
                  : 0
              } 
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm leading-tight truncate">{rpgData.email.split('@')[0]}</p>
              <p className="text-[10px] text-muted leading-tight truncate">{rpgData.current_title}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1 flex-1 bg-black rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${
                        rpgData.next_level_xp && rpgData.current_level_xp !== undefined
                          ? ((rpgData.xp - rpgData.current_level_xp) / (rpgData.next_level_xp - rpgData.current_level_xp)) * 100
                          : 0
                      }%` 
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-2 -mx-2">
            <div className="w-12 h-12 rounded-full bg-border animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-border rounded w-2/3 animate-pulse" />
              <div className="h-2 bg-border rounded w-1/2 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
