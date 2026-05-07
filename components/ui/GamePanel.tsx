'use client';

import { ReactNode, useState } from 'react';

interface GamePanelProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function GamePanel({ title, icon, defaultOpen = true, children }: GamePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl mb-6 shadow-2xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-0"></div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 w-full px-6 py-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors border-b border-white/5"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl filter grayscale contrast-150 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{icon}</span>}
          <h2 className="text-bone font-['Cinzel'] font-bold tracking-wider text-lg uppercase">{title}</h2>
        </div>
        <span className={`text-bone-dark/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </button>
      
      <div className={`relative z-10 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
