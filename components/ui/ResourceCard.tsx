'use client';

import React from 'react';
import { ResourceIcon } from '@/components/ui/Icons';
import { Resources } from '@/types/game';

interface ResourceCardProps {
  resource: keyof Resources;
  amount: number;
  rate: number;
  max?: number;
}

const RESOURCE_LABELS: Record<keyof Resources, string> = {
  corpse: 'Corpses',
  bone: 'Bones',
  flesh: 'Flesh',
  soul_residue: 'Soul Residue',
  necrotic_cement: 'Necro Cement',
  biomatter_fuel: 'Biomatter Fuel',
  magic_battery: 'Magic Battery',
  ritual_energy: 'Ritual Energy',
};

const RESOURCE_THEMES: Record<keyof Resources, { bar: string; glow: string }> = {
  corpse: { bar: 'from-zinc-700 to-zinc-500', glow: 'shadow-zinc-500/20' },
  bone: { bar: 'from-amber-100 to-yellow-200', glow: 'shadow-yellow-200/20' },
  flesh: { bar: 'from-rose-800 to-red-600', glow: 'shadow-red-600/20' },
  soul_residue: { bar: 'from-violet-600 to-fuchsia-500', glow: 'shadow-fuchsia-500/20' },
  necrotic_cement: { bar: 'from-cyan-800 to-teal-600', glow: 'shadow-teal-600/20' },
  biomatter_fuel: { bar: 'from-emerald-700 to-green-500', glow: 'shadow-green-500/20' },
  magic_battery: { bar: 'from-blue-700 to-sky-500', glow: 'shadow-sky-500/20' },
  ritual_energy: { bar: 'from-purple-800 to-indigo-600', glow: 'shadow-indigo-600/20' },
};

export function ResourceCard({ resource, amount, rate, max = 2000 }: ResourceCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const isPositive = rate > 0;
  const isNegative = rate < 0;
  const percentage = Math.min((amount / max) * 100, 100);
  const theme = RESOURCE_THEMES[resource] || { bar: 'from-violet-600 to-indigo-500', glow: 'shadow-indigo-500/20' };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/45 border border-slate-900 backdrop-blur-md hover:bg-slate-900/30 hover:border-violet-500/20 transition-all duration-300 shadow-md min-w-[130px] flex-1">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="filter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">
            <ResourceIcon name={resource} size={18} />
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">
              {RESOURCE_LABELS[resource]}
            </span>
            {rate !== 0 && (
              <span className={`text-[10px] font-mono font-bold tracking-wider ${
                isPositive ? 'text-emerald-400' : 'text-rose-500'
              }`}>
                {isPositive ? '+' : ''}{rate.toFixed(1)}/s
              </span>
            )}
            {rate === 0 && (
              <span className="text-[10px] font-mono font-bold text-slate-600 tracking-wider">
                0.0/s
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex flex-col justify-center">
          <span className="font-mono text-sm font-bold text-slate-200 leading-none">
            {formatNumber(amount)}
          </span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">/{formatNumber(max)}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-1 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/50">
        <div
          className={`h-full bg-gradient-to-r ${theme.bar} rounded-full transition-all duration-300 shadow-[0_0_8px] ${theme.glow}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
