"use client";
import { useState, useEffect } from "react";
import { Play, Pause, Square, CheckCircle2 } from "lucide-react";
import api from "@/store/api";
import confetti from "canvas-confetti";

export default function StudyTimer({ onXP }: { onXP: (amount: number) => void }) {
  const [mode, setMode] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const handleModeChange = (m: number) => {
    setMode(m);
    setTimeLeft(m * 60);
    setIsActive(false);
  };

  const handleComplete = async () => {
    setIsActive(false);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    
    try {
      await api.post("/dashboard/study-sessions", { duration_minutes: mode, mode: mode.toString() });
      await api.post("/dashboard/xp", { amount: mode * 10, reason: `Completed ${mode}m Focus Session` });
      onXP(mode * 10);
    } catch (e) {
      console.error(e);
    }
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(mode * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${((mode * 60 - timeLeft) / (mode * 60)) * 100}%` }} />
      </div>

      <div className="flex space-x-2 mb-6">
        {[25, 45, 60, 90].map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${mode === m ? 'bg-white text-black' : 'bg-white/10 text-muted hover:bg-white/20'}`}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="text-6xl font-bold tracking-tighter mb-8 tabular-nums">
        {formatTime(timeLeft)}
      </div>

      <div className="flex space-x-4">
        <button onClick={toggleTimer} className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${isActive ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-600 text-white'}`}>
          {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
        <button onClick={stopTimer} className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center transition-transform hover:scale-105">
          <Square className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
}
