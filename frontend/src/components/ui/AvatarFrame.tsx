import React from 'react';

type FrameTier = 'iron_recruit' | 'bronze_scholar' | 'silver_specialist' | 'gold_achiever' | 'platinum_visionary' | 'diamond_master' | 'master_sage' | 'grandmaster_luminary' | 'challenger_apex' | 'legendary_sovereign' | string;

interface AvatarFrameProps {
  tier: FrameTier;
  size?: number;
  imageUrl?: string;
  level?: number;
  xpProgress?: number; // 0 to 1
}

export default function AvatarFrame({ tier, size = 64, imageUrl = "https://github.com/shadcn.png", level, xpProgress }: AvatarFrameProps) {
  
  const avatarSize = size * 0.75;
  const offset = (size - avatarSize) / 2;
  
  // Progress Ring logic
  const ringRadius = size / 2 - 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = xpProgress !== undefined ? ringCircumference - (xpProgress * ringCircumference) : ringCircumference;
  
  const renderFrameSVG = () => {
    // Dynamic Prestige Frames (110, 120... 490)
    if (tier.startsWith('prestige_')) {
      const pLevel = parseInt(tier.split('_')[1]);
      const isHundreds = pLevel % 100 === 0;
      
      // Determine base colors by hundred bracket
      let color1, color2, color3;
      if (pLevel < 200) { color1 = "#c084fc"; color2 = "#818cf8"; color3 = "#2dd4bf"; } // Diamond
      else if (pLevel < 300) { color1 = "#f43f5e"; color2 = "#a855f7"; color3 = "#ef4444"; } // Master
      else if (pLevel < 400) { color1 = "#dc2626"; color2 = "#ea580c"; color3 = "#b91c1c"; } // GM
      else { color1 = "#60a5fa"; color2 = "#f59e0b"; color3 = "#fbbf24"; } // Challenger
      
      const numStars = Math.floor((pLevel % 100) / 10);
      
      return (
        <>
          <defs>
            <linearGradient id={`grad-${pLevel}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="50%" stopColor={color2} />
              <stop offset="100%" stopColor={color3} />
            </linearGradient>
            <filter id={`glow-${pLevel}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={isHundreds ? "6" : "4"} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle cx={size/2} cy={size/2} r={size/2 - 6} fill="none" stroke={`url(#grad-${pLevel})`} strokeWidth={isHundreds ? "12" : "8"} filter={`url(#glow-${pLevel})`} />
          
          {/* Dynamic Stars orbiting */}
          {numStars > 0 && Array.from({length: numStars}).map((_, i) => {
            const angle = (360 / numStars) * i;
            return (
              <g key={i}>
                <animateTransform attributeName="transform" type="rotate" from={`${angle} ${size/2} ${size/2}`} to={`${angle + 360} ${size/2} ${size/2}`} dur="10s" repeatCount="indefinite" />
                <circle cx={size/2} cy={8} r={3} fill="#ffffff" filter={`url(#glow-${pLevel})`} />
              </g>
            )
          })}
        </>
      );
    }

    switch (tier) {
      case 'iron_recruit':
        return (
          <>
            <circle cx={size/2} cy={size/2} r={size/2 - 2} fill="none" stroke="#4b5563" strokeWidth="4" />
            <circle cx={size/2} cy={size/2} r={size/2 - 6} fill="none" stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 4" />
          </>
        );
      case 'bronze_scholar':
        return (
          <>
            <defs>
              <linearGradient id="bronze" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8c5a3c" />
                <stop offset="50%" stopColor="#cd7f32" />
                <stop offset="100%" stopColor="#5c3a21" />
              </linearGradient>
            </defs>
            <circle cx={size/2} cy={size/2} r={size/2 - 3} fill="none" stroke="url(#bronze)" strokeWidth="6" />
            <path d={`M ${size/2} 2 L ${size/2 - 6} 8 L ${size/2 + 6} 8 Z`} fill="#fcd34d" />
            <path d={`M ${size/2} ${size-2} L ${size/2 - 6} ${size-8} L ${size/2 + 6} ${size-8} Z`} fill="#fcd34d" />
          </>
        );
      case 'silver_specialist':
        return (
          <>
            <defs>
              <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e5e7eb" />
                <stop offset="50%" stopColor="#9ca3af" />
                <stop offset="100%" stopColor="#4b5563" />
              </linearGradient>
              <filter id="glow-silver" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx={size/2} cy={size/2} r={size/2 - 4} fill="none" stroke="url(#silver)" strokeWidth="8" filter="url(#glow-silver)" />
            <circle cx={size/2} cy={size/2} r={size/2 - 10} fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 6">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${size/2} ${size/2}`} to={`360 ${size/2} ${size/2}`} dur="10s" repeatCount="indefinite" />
            </circle>
          </>
        );
      case 'gold_achiever':
        return (
          <>
            <defs>
              <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx={size/2} cy={size/2} r={size/2 - 4} fill="none" stroke="url(#gold)" strokeWidth="8" filter="url(#glow-gold)" />
            <path d={`M ${size/2} 0 L ${size/2+4} ${size/2-4} L ${size} ${size/2} L ${size/2+4} ${size/2+4} L ${size/2} ${size} L ${size/2-4} ${size/2+4} L 0 ${size/2} L ${size/2-4} ${size/2-4} Z`} fill="none" stroke="#fcd34d" strokeWidth="1">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${size/2} ${size/2}`} to={`360 ${size/2} ${size/2}`} dur="20s" repeatCount="indefinite" />
            </path>
          </>
        );
      case 'diamond_master':
        return (
          <>
            <defs>
              <linearGradient id="diamond" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="33%" stopColor="#818cf8" />
                <stop offset="66%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
              <filter id="glow-diamond" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx={size/2} cy={size/2} r={size/2 - 6} fill="none" stroke="url(#diamond)" strokeWidth="10" filter="url(#glow-diamond)" />
            <polygon points={`${size/2},2 ${size-2},${size/4} ${size-2},${size*0.75} ${size/2},${size-2} 2,${size*0.75} 2,${size/4}`} fill="none" stroke="#e879f9" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${size/2} ${size/2}`} to={`360 ${size/2} ${size/2}`} dur="10s" repeatCount="indefinite" />
            </polygon>
            <circle cx={size/2} cy={size/2} r={size/2} fill="none" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 12">
               <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        );
      case 'master_sage':
        return (
          <>
            <defs>
              <linearGradient id="master" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <filter id="glow-master" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx={size/2} cy={size/2} r={size/2 - 6} fill="none" stroke="url(#master)" strokeWidth="12" filter="url(#glow-master)" />
            <path d={`M ${size/2} 2 L ${size-2} ${size-2} L 2 ${size-2} Z`} fill="none" stroke="#fda4af" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${size/2} ${size/2}`} to={`360 ${size/2} ${size/2}`} dur="8s" repeatCount="indefinite" />
            </path>
            <path d={`M ${size/2} ${size-2} L 2 2 L ${size-2} 2 Z`} fill="none" stroke="#fbcfe8" strokeWidth="2">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${size/2} ${size/2}`} to={`-360 ${size/2} ${size/2}`} dur="8s" repeatCount="indefinite" />
            </path>
          </>
        );
      case 'grandmaster_luminary':
        return (
          <>
            <defs>
              <linearGradient id="grandmaster" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
              <filter id="glow-gm" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx={size/2} cy={size/2} r={size/2 - 8} fill="none" stroke="url(#grandmaster)" strokeWidth="16" filter="url(#glow-gm)" />
            <circle cx={size/2} cy={size/2} r={size/2 - 4} fill="none" stroke="#fca5a5" strokeWidth="2" strokeDasharray="10 20 5 15">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${size/2} ${size/2}`} to={`360 ${size/2} ${size/2}`} dur="5s" repeatCount="indefinite" />
            </circle>
            <path d={`M ${size/2} 4 L ${size*0.75} ${size/4} L ${size-4} ${size/2} L ${size*0.75} ${size*0.75} L ${size/2} ${size-4} L ${size/4} ${size*0.75} L 4 ${size/2} L ${size/4} ${size/4} Z`} fill="none" stroke="#fed7aa" strokeWidth="2">
               <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
            </path>
          </>
        );
      case 'challenger_apex':
        return (
          <>
            <defs>
              <linearGradient id="challenger" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="30%" stopColor="#3b82f6" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <filter id="glow-challenger" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx={size/2} cy={size/2} r={size/2 - 8} fill="none" stroke="url(#challenger)" strokeWidth="16" filter="url(#glow-challenger)" />
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${size/2} ${size/2}`} to={`360 ${size/2} ${size/2}`} dur="12s" repeatCount="indefinite" />
              <polygon points={`${size/2},0 ${size},${size/2} ${size/2},${size} 0,${size/2}`} fill="none" stroke="#93c5fd" strokeWidth="2" />
              <polygon points={`${size/4},${size/4} ${size*0.75},${size/4} ${size*0.75},${size*0.75} ${size/4},${size*0.75}`} fill="none" stroke="#fcd34d" strokeWidth="2" />
            </g>
          </>
        );
      case 'legendary_sovereign':
        return (
          <>
            <defs>
              <linearGradient id="legendary" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444">
                  <animate attributeName="stop-color" values="#ef4444;#eab308;#22c55e;#3b82f6;#a855f7;#ef4444" dur="4s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#3b82f6">
                  <animate attributeName="stop-color" values="#3b82f6;#a855f7;#ef4444;#eab308;#22c55e;#3b82f6" dur="4s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
              <filter id="glow-legendary" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx={size/2} cy={size/2} r={size/2 - 10} fill="none" stroke="url(#legendary)" strokeWidth="20" filter="url(#glow-legendary)" />
            <path d={`M ${size/2} -5 L ${size/2+5} ${size/2-5} L ${size+5} ${size/2} L ${size/2+5} ${size/2+5} L ${size/2} ${size+5} L ${size/2-5} ${size/2+5} L -5 ${size/2} L ${size/2-5} ${size/2-5} Z`} fill="none" stroke="#ffffff" strokeWidth="3">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${size/2} ${size/2}`} to={`360 ${size/2} ${size/2}`} dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </path>
            <circle cx={size/2} cy={size/2} r={size/2 - 2} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="5 15">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${size/2} ${size/2}`} to={`-360 ${size/2} ${size/2}`} dur="3s" repeatCount="indefinite" />
            </circle>
          </>
        );
      default:
        return <circle cx={size/2} cy={size/2} r={size/2 - 2} fill="none" stroke="#374151" strokeWidth="4" />;
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center group" style={{ width: size, height: size }}>
      {/* Background Avatar */}
      <img 
        src={imageUrl} 
        alt="User Avatar" 
        className="rounded-full object-cover absolute"
        style={{ width: avatarSize, height: avatarSize, left: offset, top: offset, zIndex: 0 }}
      />
      
      {/* Dynamic SVG Frame overlayed precisely over the avatar with a mask to protect the center face */}
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="absolute inset-0 z-10 pointer-events-none"
      >
        <defs>
          <mask id={`avatar-hole-mask-${tier}-${size}`} maskUnits="userSpaceOnUse" x="0" y="0" width={size} height={size}>
            <rect x="0" y="0" width={size} height={size} fill="white" />
            {/* Cut out the inner center so spikes don't cross the face */}
            <circle cx={size/2} cy={size/2} r={size/2 - 12} fill="black" />
          </mask>
        </defs>
        <g mask={`url(#avatar-hole-mask-${tier}-${size})`}>
          {renderFrameSVG()}
        </g>
        
        {/* XP Progress Ring (always on top, unmasked) */}
        {xpProgress !== undefined && (
          <circle 
            cx={size/2} cy={size/2} r={ringRadius} 
            fill="none" 
            stroke="#22c55e" 
            strokeWidth="3"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            className="transition-all duration-500 ease-out drop-shadow-[0_0_4px_rgba(34,197,94,0.8)]"
          />
        )}
      </svg>
      
      {/* Level Badge - Only show if level is provided */}
      {level !== undefined && (
        <div 
          className="absolute z-20 flex items-center justify-center bg-black border border-white/20 rounded-full font-bold shadow-lg"
          style={{ 
            width: size * 0.35, 
            height: size * 0.35, 
            bottom: -size * 0.05, 
            fontSize: size * 0.15,
            color: tier === 'diamond_master' ? '#c084fc' : tier === 'gold_achiever' ? '#fbbf24' : 'white'
          }}
        >
          {level}
        </div>
      )}
    </div>
  );
}
