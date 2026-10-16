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
    primary: 'bg-blue-500/20 hover:bg-blue-500/30 text-slate-100 border-blue-500/30 hover:border-blue-500/70 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]',
    secondary: 'bg-slate-500/20 hover:bg-slate-500/30 text-slate-100 border-slate-500/30 hover:border-slate-500/70',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-slate-100 border-red-500/30 hover:border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]',
    success: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-slate-100 border-emerald-500/30 hover:border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden group w-full px-5 py-4 font-bold rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between border backdrop-blur-md ${variantClass} ${colorClass || ''}`}
    >
      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0 pointer-events-none"></div>
      
      <span className="relative z-10 flex items-center gap-3">
        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
        <span className="font-semibold tracking-wide text-sm uppercase">{label}</span>
      </span>
      {cost && (
        <span className="relative z-10 text-xs font-mono bg-slate-900/60 border border-slate-600/50 px-3 py-1.5 rounded backdrop-blur-sm">
          {cost}
        </span>
      )}
    </button>
  );
}
