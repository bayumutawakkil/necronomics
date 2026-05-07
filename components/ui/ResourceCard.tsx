'use client';

import React from 'react';
import { RESOURCE_ICONS } from '@/lib/game/constants';
import { Resources } from '@/types/game';

interface ResourceCardProps {
  resource: keyof Resources;
  amount: number;
  rate: number;
}

const RESOURCE_LABELS: Record<keyof Resources, string> = {
  corpse: 'Corpses',
  bone: 'Bone',
  flesh: 'Flesh',
  soul_residue: 'Soul Residue',
  necrotic_cement: 'Necrotic Cement',
  biomatter_fuel: 'Biomatter Fuel',
  magic_battery: 'Magic Battery',
  ritual_energy: 'Ritual Energy',
};

export function ResourceCard({ resource, amount, rate }: ResourceCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  };

  const isPositive = rate > 0;
  const isNegative = rate < 0;

  return (
    <div className="relative group overflow-hidden bg-black/40 backdrop-blur-md border border-white/5 rounded-lg p-3 flex items-center justify-between transition-all duration-300 hover:bg-white/5 hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
          <span className="text-lg filter grayscale contrast-150 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-300">
            {RESOURCE_ICONS[resource]}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-['Cinzel'] text-[9px] font-bold tracking-[0.1em] uppercase text-bone-dark/80">
            {RESOURCE_LABELS[resource]}
          </span>
          <span className="font-mono text-lg font-bold text-bone tracking-tight leading-none">
            {formatNumber(amount)}
          </span>
        </div>
      </div>
      
      {rate !== 0 && (
        <div className={`relative z-10 font-mono text-[10px] px-2 py-0.5 rounded border ${
          isPositive 
            ? 'text-moss-light bg-moss/10 border-moss/20' 
            : 'text-blood-light bg-blood/10 border-blood/20'
        }`}>
          {isPositive ? '+' : ''}{rate.toFixed(2)}/s
        </div>
      )}
    </div>
  );
}
