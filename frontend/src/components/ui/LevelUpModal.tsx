import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import AvatarFrame from './AvatarFrame';
import { Trophy, ChevronRight } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  newFrames: string[];
  onEquip?: (frameId: string) => void;
}

export default function LevelUpModal({ isOpen, onClose, oldLevel, newLevel, newFrames, onEquip }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#f59e0b', '#3b82f6']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#f59e0b', '#3b82f6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasNewFrame = newFrames && newFrames.length > 0;
  const bestFrame = hasNewFrame ? newFrames[newFrames.length - 1] : null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-card border border-white/20 p-10 rounded-3xl max-w-md w-full text-center relative overflow-hidden"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -translate-x-full animate-[shimmer_2s_infinite]" />
          
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          
          <h2 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mb-2">
            Level Up!
          </h2>
          
          <div className="flex items-center justify-center gap-4 my-8">
            <span className="text-4xl font-mono text-muted line-through">{oldLevel}</span>
            <ChevronRight className="w-8 h-8 text-white/50" />
            <motion.span 
              initial={{ scale: 1.5, color: '#fff' }}
              animate={{ scale: 1, color: '#fbbf24' }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-6xl font-black font-mono text-yellow-400"
            >
              {newLevel}
            </motion.span>
          </div>

          {bestFrame && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 pt-8 border-t border-white/10"
            >
              <p className="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-4">New Frame Unlocked</p>
              <div className="flex justify-center mb-6">
                <AvatarFrame tier={bestFrame} size={120} />
              </div>
              <div className="flex gap-4">
                <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-colors">
                  Keep Current
                </button>
                <button 
                  onClick={() => {
                    if(onEquip) onEquip(bestFrame);
                    onClose();
                  }} 
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                >
                  Equip Now
                </button>
              </div>
            </motion.div>
          )}

          {!bestFrame && (
            <button onClick={onClose} className="mt-8 w-full py-4 rounded-xl font-bold bg-white text-black hover:bg-gray-200 transition-colors">
              Continue
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
