"use client";

import { useEffect, useState } from "react";
import api from "@/store/api";
import AvatarFrame from "@/components/ui/AvatarFrame";
import LevelUpModal from "@/components/ui/LevelUpModal";
import { Lock, Unlock, Zap, Activity } from "lucide-react";

export default function FrameCollectionPage() {
  const [collection, setCollection] = useState<any[]>([]);
  const [rpgProfile, setRpgProfile] = useState<any>(null);
  
  // Level Up Modal State
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<any>(null);
  
  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const loadData = () => {
    api.get("/rpg/collection").then(res => setCollection(res.data.collection)).catch(console.error);
    api.get("/rpg/profile").then(res => {
      setRpgProfile(res.data);
      window.dispatchEvent(new Event("rpg_update"));
    }).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEquip = async (frameId: string) => {
    try {
      await api.post("/rpg/equip", { frame_id: frameId });
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to equip frame");
    }
  };

  const testAddXP = async () => {
    try {
      const res = await api.post("/rpg/add_xp", { amount: 1000 });
      if (res.data.level_up_info) {
        setLevelUpData(res.data.level_up_info);
        setShowLevelUp(true);
      }
      loadData();
    } catch(err) {
      console.error(err);
    }
  };
  
  const resetProgress = async () => {
    if (!confirm("Are you sure you want to reset all your progress?")) return;
    try {
      await api.post("/rpg/reset");
      loadData();
    } catch(err) {
      console.error(err);
    }
  };

  const changeAvatar = async (url: string) => {
    try {
      await api.post("/rpg/avatar", { avatar_url: url });
      loadData();
      setShowAvatarModal(false);
    } catch(err) {
      console.error(err);
    }
  };

  if (!rpgProfile) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full min-h-screen pb-20">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Frame Collection</h1>
          <p className="text-muted">Unlock prestigious frames by leveling up your scholar profile.</p>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex flex-wrap gap-2 mb-4 justify-end">
            <button onClick={resetProgress} className="flex items-center space-x-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-full text-sm font-bold transition-colors border border-red-500/20">
              <span>Reset Progress</span>
            </button>
            <button onClick={() => setShowAvatarModal(true)} className="flex items-center space-x-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 px-4 py-2 rounded-full text-sm font-bold transition-colors border border-purple-500/20">
              <span>Change Avatar</span>
            </button>
            <button onClick={testAddXP} className="flex items-center space-x-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 px-4 py-2 rounded-full text-sm font-bold transition-colors border border-yellow-500/20">
              <Zap className="w-4 h-4" />
              <span>Test Add 1000 XP</span>
            </button>
          </div>
          <div className="bg-card border border-border p-4 rounded-xl flex items-center space-x-4">
            <AvatarFrame tier={rpgProfile.current_frame} size={64} level={rpgProfile.level} imageUrl={rpgProfile.avatar_url} />
            <div>
              <p className="text-sm text-muted">Current Rank</p>
              <p className="text-xl font-bold">{rpgProfile.current_title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collection.map((frame) => (
          <div 
            key={frame.id} 
            className={`relative p-6 rounded-2xl border transition-all duration-300 ${
              frame.is_equipped ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(79,70,229,0.1)]" : 
              frame.is_unlocked ? "border-border bg-card hover:border-white/30" : 
              "border-border/30 bg-black/50 opacity-40 grayscale blur-[2px]"
            }`}
          >
            {frame.is_equipped && (
              <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                Equipped
              </div>
            )}
            
            {!frame.is_unlocked && (
              <div className="absolute top-4 right-4 flex items-center space-x-1 text-muted">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-medium">Lv. {frame.required_level}</span>
              </div>
            )}

            <div className="flex flex-col items-center text-center mt-4">
              <div className="mb-6 h-[160px] flex items-center justify-center">
                <AvatarFrame tier={frame.id} size={140} imageUrl={rpgProfile.avatar_url} />
              </div>
              
              <h3 className="text-xl font-bold mb-1">{frame.title}</h3>
              <p className="text-sm text-muted mb-6">
                {frame.is_unlocked ? "Unlocked Frame" : `Unlocks at Level ${frame.required_level}`}
              </p>
              
              {frame.is_unlocked && !frame.is_equipped && (
                <button 
                  onClick={() => handleEquip(frame.id)}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                  Equip
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {levelUpData && (
        <LevelUpModal 
          isOpen={showLevelUp} 
          onClose={() => setShowLevelUp(false)}
          oldLevel={levelUpData.old_level}
          newLevel={levelUpData.new_level}
          newFrames={levelUpData.new_frames_unlocked}
          onEquip={handleEquip}
        />
      )}

      {showAvatarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">Choose your Avatar</h2>
              <button onClick={() => setShowAvatarModal(false)} className="text-muted hover:text-white">Close</button>
            </div>
            <div className="p-6 grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
              {[1, 2, 3, 4, 5, 118, 242, 244, 473, 265, 196, 283, 7, 8, 9, 47, 50].map(id => {
                const url = `https://rickandmortyapi.com/api/character/avatar/${id}.jpeg`;
                return (
                  <button 
                    key={id}
                    onClick={() => changeAvatar(url)}
                    className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all hover:scale-105"
                  >
                    <img src={url} alt={`Avatar ${id}`} className="w-full h-full object-cover" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
