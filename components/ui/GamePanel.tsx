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
    <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-md border border-slate-700/40 rounded-lg shadow-lg transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full px-4 py-3 flex items-center justify-between bg-slate-800/60 hover:bg-slate-800/80 transition-colors border-b border-slate-700/40"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <h2 className="text-slate-100 font-semibold tracking-wide text-sm uppercase">{title}</h2>
        </div>
        <span className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </button>
      
      <div className={`relative transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <div className="p-4 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}
