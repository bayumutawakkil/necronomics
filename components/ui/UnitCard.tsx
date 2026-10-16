'use client';

import { Unit } from '@/types/game';
import { getUnitEffectiveStats } from '@/lib/game/calculations';
import { UnitIcon } from '@/components/ui/Icons';

interface UnitCardProps {
  unit: Unit;
  count?: number;
  completedResearches?: string[];
}

const UNIT_META: Record<string, {
  label: string;
  role: string;
  color: string;
  barColor: string;
}> = {
  skeleton: { label: 'Skeleton', role: 'Morgue / Graveyard', color: 'text-yellow-100', barColor: 'bg-yellow-100' },
  zombie:   { label: 'Zombie',   role: 'Bone Mill',         color: 'text-green-400', barColor: 'bg-green-500' },
  ghoul:    { label: 'Ghoul',    role: 'Decay Pit',         color: 'text-orange-500', barColor: 'bg-orange-500' },
  ghost:    { label: 'Ghost',    role: 'Necro Factory',     color: 'text-violet-400', barColor: 'bg-violet-400' },
  vampire:  { label: 'Vampire',  role: 'Ritual Chamber',    color: 'text-rose-500', barColor: 'bg-rose-600' },
};

export function UnitCard({ unit, count = 1, completedResearches = [] }: UnitCardProps) {
  const meta = UNIT_META[unit.type] ?? { label: unit.type, role: 'Unassigned', color: 'text-slate-200', barColor: 'bg-slate-500' };
  const effectiveStats = getUnitEffectiveStats(unit.type, completedResearches);

  // Calculate freshness bar color
  const freshnessVal = unit.freshness ?? 100;
  const isDecaying = effectiveStats.decay_rate > 0;
  
  let healthColor = 'bg-emerald-500';
  if (freshnessVal < 30) healthColor = 'bg-rose-600 animate-pulse';
  else if (freshnessVal < 60) healthColor = 'bg-amber-500';

  return (
    <div className="flex flex-col gap-2.5 p-3.5 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.07)]">
            <UnitIcon name={unit.type} size={22} />
          </span>
          <div className="flex flex-col">
            <span className={`text-sm font-bold uppercase tracking-wider font-display ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              {meta.role}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-violet-400 font-mono leading-none">
            x{count}
          </span>
          <span className="text-[9px] text-slate-500 font-mono mt-0.5">Active</span>
        </div>
      </div>

      {/* Freshness Bar */}
      {isDecaying ? (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-slate-400 uppercase tracking-widest font-bold">Rot State (Freshness)</span>
            <span className={`font-bold ${freshnessVal < 30 ? 'text-rose-500' : 'text-slate-300'}`}>
              {Math.ceil(freshnessVal)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
            <div
              className={`h-full ${healthColor} rounded-full transition-all duration-500`}
              style={{ width: `${freshnessVal}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-slate-500 text-right">
            Decay: -{effectiveStats.decay_rate.toFixed(2)}%/s
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-slate-400 uppercase tracking-widest font-bold font-display">Rot State</span>
            <span className="text-emerald-400 font-bold uppercase">Undead (Immortal)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
          </div>
        </div>
      )}

      {/* Core Stats */}
      <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/50 p-2 rounded-lg border border-slate-900/60 font-mono">
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-400 uppercase tracking-widest font-bold">EFFICIENCY</span>
          <span className="text-emerald-400 font-bold text-xs">
            +{(effectiveStats.efficiency * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-slate-400 uppercase tracking-widest font-bold">MAINTENANCE</span>
          <span className="text-orange-400 font-bold text-xs">
            -{((effectiveStats.maintenance_cost?.bone ?? 0) * count).toFixed(2)} bone/s
          </span>
        </div>
      </div>
      {effectiveStats.decay_rate < unit.decay_rate && (
        <div className="text-[9px] text-violet-300 font-mono text-center">
          {Math.round((1 - effectiveStats.decay_rate / unit.decay_rate) * 100)}% decay reduction (research)
        </div>
      )}
    </div>
  );
}
