'use client';

import React from 'react';

interface ActionButtonProps {
  icon: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
  cost?: string;
  colorClass?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export function ActionButton({
  icon,
  label,
  disabled,
  onClick,
  cost,
  colorClass,
  variant = 'primary',
}: ActionButtonProps) {
  const variantClass = {
    primary: 'bg-soul/20 hover:bg-soul/30 text-bone border-soul/30 hover:border-soul/70 shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]',
    secondary: 'bg-rot/20 hover:bg-rot/30 text-bone border-rot/30 hover:border-rot/70',
    danger: 'bg-blood/20 hover:bg-blood/30 text-bone border-blood/30 hover:border-blood/70 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]',
    success: 'bg-moss/20 hover:bg-moss/30 text-bone border-moss/30 hover:border-moss/70 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)]',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden group w-full px-5 py-4 font-bold rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between border backdrop-blur-md ${variantClass} ${colorClass || ''}`}
    >
      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0 pointer-events-none"></div>
      
      <span className="relative z-10 flex items-center gap-3">
        <span className="text-2xl filter grayscale contrast-150 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform duration-300">{icon}</span>
        <span className="font-['Cinzel'] tracking-wider text-sm uppercase">{label}</span>
      </span>
      {cost && (
        <span className="relative z-10 text-xs font-mono bg-black/40 border border-white/10 px-3 py-1.5 rounded-md backdrop-blur-sm shadow-inner">
          {cost}
        </span>
      )}
    </button>
  );
}
