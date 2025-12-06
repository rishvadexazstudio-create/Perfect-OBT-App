
import React from 'react';

export const Logo: React.FC<{ className?: string, size?: 'sm' | 'lg' }> = ({ className = "", size = 'lg' }) => {
  const isSmall = size === 'sm';
  
  // Configuration for 6 figures in a circular formation
  // Colors approximate the rainbow spectrum in the reference image
  // Order: Orange (Top-Left), Blue, Purple, Pink, Green, Red
  const figures = [
    { color: '#f97316', angle: 330 },  // Orange (Top Left)
    { color: '#3b82f6', angle: 30 },   // Blue (Top Right)
    { color: '#8b5cf6', angle: 90 },   // Purple (Right)
    { color: '#d946ef', angle: 150 },  // Pink/Magenta (Bottom Right)
    { color: '#22c55e', angle: 210 },  // Green (Bottom Left)
    { color: '#ef4444', angle: 270 },  // Red (Left)
  ];

  return (
    <div className={`flex items-center ${isSmall ? 'justify-center' : 'gap-5'} ${className}`}>
      {/* Icon: Ring of 6 People */}
      <svg 
        viewBox="0 0 100 100" 
        className={`${isSmall ? 'w-10 h-10' : 'w-28 h-28'} shrink-0`}
        fill="none"
        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.05))' }}
      >
        {figures.map((fig, i) => (
          <g key={i} transform={`rotate(${fig.angle} 50 50)`}>
            {/* Head: Small dot */}
            <circle cx="50" cy="12" r="6" fill={fig.color} />
            
            {/* Body: Swooping Crescent Shape */}
            <path 
              d="M 33 26 Q 50 52 67 26 Q 50 38 33 26 Z" 
              fill={fig.color} 
            />
          </g>
        ))}
      </svg>
      
      {/* Typography Lockup - Displayed when size is 'lg' */}
      {!isSmall && (
        <div className="flex flex-col items-start justify-center pt-2">
          {/* Top Line */}
          <h3 className="text-[14px] font-bold text-gray-800 tracking-wider uppercase leading-none mb-1.5 ml-0.5">
            ON BOARDING TEAM
          </h3>
          
          {/* Middle Line: Dash + OBT */}
          <div className="flex items-center gap-4">
            {/* The thick rectangular dash */}
            <div className="h-[12px] w-[36px] bg-gray-800 rounded-[2px] mt-1"></div>
            {/* The OBT text */}
            <h1 className="text-[4rem] font-black text-gray-900 tracking-tight leading-[0.85]">
              OBT
            </h1>
          </div>
          
          {/* Bottom Line */}
          <p className="text-[12px] text-gray-600 font-bold uppercase tracking-widest mt-2 ml-0.5">
            UNIT OF DEXAZ STUDIO'S
          </p>
        </div>
      )}
    </div>
  );
};
