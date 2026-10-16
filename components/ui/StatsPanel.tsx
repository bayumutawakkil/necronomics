'use client';

import { useState } from 'react';
import { Building, Unit, Resources } from '@/types/game';
import { 
  calculateResourceFlowBreakdown, 
  calculateUnitEfficiencyBonus 
} from '@/lib/game/calculations';
import { 
  ClockIcon, HourglassIcon, CorpseIcon, ZombieIcon, 
  StructuresIcon, ResourceIcon, StarIcon, CheckIcon, WarningIcon,
  ArrowUpIcon, ArrowDownIcon
} from '@/components/ui/Icons';

interface StatsPanelProps {
  stats: {
    total_corpses_processed: number;
    total_undead_created: number;
    total_buildings_built: number;
    uptime_seconds: number;
  };
  tick: number;
  buildings?: Building[];
  units?: Unit[];
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

export function StatsPanel({ stats, tick, buildings = [], units = [] }: StatsPanelProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'ledger'>('analytics');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  // Time format helper
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Calculations for Colony Analytics
  const totalUndead = units.length;
  const assignedUndead = units.filter(u => u.assigned_to).length;
  const idleUndead = totalUndead - assignedUndead;
  
  const avgFreshness = totalUndead > 0 
    ? units.reduce((sum, u) => sum + (u.freshness ?? 100), 0) / totalUndead 
    : 0;

  const globalEfficiencyBonus = calculateUnitEfficiencyBonus(units);
  const avgEfficiency = totalUndead > 0 ? (globalEfficiencyBonus / totalUndead) * 100 : 0;

  // Group structures by type for count representation
  const graveyards = buildings.filter(b => b.type === 'graveyard').length;
  const morgues = buildings.filter(b => b.type === 'morgue').length;
  const boneMills = buildings.filter(b => b.type === 'bone_mill').length;
  const factories = buildings.filter(b => b.type === 'necro_factory').length;
  const chambers = buildings.filter(b => b.type === 'ritual_chamber').length;
  const pits = buildings.filter(b => b.type === 'decay_pit').length;

  // Economy ledger breakdown
  const ledger = calculateResourceFlowBreakdown(buildings, units);

  return (
    <div className="flex flex-col gap-4 bg-slate-950/85 border border-slate-900 rounded-xl p-4.5 backdrop-blur-md shadow-2xl animate-fade-in-up">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-900 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-display text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-b-2 border-violet-500 text-violet-300'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Colony Analytics
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 font-display text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
            activeTab === 'ledger'
              ? 'border-b-2 border-violet-500 text-violet-300'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Economic Ledger
        </button>
      </div>

      {/* Tab 1: Colony Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Section A: Active Core Metrics */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">System Upgrades</h3>
            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                <span className="text-slate-400 flex items-center gap-1.5"><ClockIcon size={14} /> Ticks</span>
                <span className="text-slate-200 font-bold">{tick.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                <span className="text-slate-400 flex items-center gap-1.5"><HourglassIcon size={14} /> Uptime</span>
                <span className="text-slate-200 font-bold">{formatTime(stats.uptime_seconds)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                <span className="text-slate-400 flex items-center gap-1.5"><CorpseIcon size={14} /> Processed</span>
                <span className="text-slate-200 font-bold">{stats.total_corpses_processed.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Section B: Workforce Reports */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">Workforce Overview</h3>
            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                <span className="text-slate-400 flex items-center gap-1.5"><ZombieIcon size={14} /> Population</span>
                <span className="text-slate-200 font-bold">
                  {totalUndead} <span className="text-[10px] text-slate-500">({assignedUndead} active / {idleUndead} idle)</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                <span className="text-slate-400">Rot State (Average)</span>
                <span className={`font-bold ${avgFreshness < 35 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
                  {avgFreshness.toFixed(1)}% Freshness
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                <span className="text-slate-400">Labor Efficiency</span>
                <span className="text-emerald-400 font-bold">
                  +{avgEfficiency.toFixed(0)}% avg / unit
                </span>
              </div>
            </div>
          </div>

          {/* Section C: Real Estate Listings */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display">Infrastructure Distribution</h3>
            <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg text-xs font-mono grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Graveyard</span>
                <span className="text-slate-200 font-bold">{graveyards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Morgue</span>
                <span className="text-slate-200 font-bold">{morgues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bone Mill</span>
                <span className="text-slate-200 font-bold">{boneMills}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Factory</span>
                <span className="text-slate-200 font-bold">{factories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ritual</span>
                <span className="text-slate-200 font-bold">{chambers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Decay Pit</span>
                <span className="text-slate-200 font-bold">{pits}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Economic Ledger */}
      {activeTab === 'ledger' && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
            Click on any resource row to inspect specific gains (inflows) and losses (outflows)
          </div>

          <div className="flex flex-col gap-1.5">
            {Object.values(ledger).map((item) => {
              const netRate = item.totalGained - item.totalSpent;
              const isExpanded = expandedResource === item.resource;
              
              let rateColor = 'text-slate-400';
              if (netRate > 0) rateColor = 'text-emerald-400';
              else if (netRate < 0) rateColor = 'text-orange-400';

              return (
                <div 
                  key={item.resource}
                  className="bg-slate-950/40 border border-slate-900 rounded-lg overflow-hidden transition-all duration-300"
                >
                  {/* Summary Bar */}
                  <button
                    onClick={() => setExpandedResource(isExpanded ? null : item.resource)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-900/10 cursor-pointer transition-colors text-xs font-mono text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ResourceIcon name={item.resource} size={16} />
                      <span className="font-display font-bold text-slate-300 uppercase tracking-widest">
                        {RESOURCE_LABELS[item.resource]}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="flex flex-col md:flex-row md:gap-4 leading-none">
                        <span className="text-[10px] text-slate-500">
                          In: <span className="text-emerald-500 font-bold">+{item.totalGained.toFixed(2)}/s</span>
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Out: <span className="text-orange-400 font-bold">-{item.totalSpent.toFixed(2)}/s</span>
                        </span>
                      </div>
                      <span className={`font-bold w-16 text-right ${rateColor}`}>
                        {netRate > 0 ? '+' : ''}{netRate.toFixed(2)}/s
                      </span>
                      <span className="text-slate-500">
                        {isExpanded ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
                      </span>
                    </div>
                  </button>

                  {/* Expansion Breakdown Ledger details */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-slate-950/70 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono animate-fade-in-up">
                      
                      {/* Gained Inflows */}
                      <div className="flex flex-col gap-1.5 border-r border-slate-900/60 pr-4">
                        <h4 className="font-display text-[9px] font-bold text-emerald-500 uppercase tracking-widest pb-1 border-b border-slate-900/40">
                          Production / Inflows
                        </h4>
                        {item.gains.length === 0 ? (
                          <span className="text-slate-500 italic text-[10px]">Zero active producers</span>
                        ) : (
                          item.gains.map((gain, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span>• {gain.source}</span>
                              <span className="text-emerald-400 font-bold">+{gain.rate.toFixed(2)}/s</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Spent Outflows */}
                      <div className="flex flex-col gap-1.5">
                        <h4 className="font-display text-[9px] font-bold text-orange-400 uppercase tracking-widest pb-1 border-b border-slate-900/40">
                          Consumption / Outflows
                        </h4>
                        {item.losses.length === 0 ? (
                          <span className="text-slate-500 italic text-[10px]">Zero active consumers</span>
                        ) : (
                          item.losses.map((loss, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span>• {loss.sink}</span>
                              <span className="text-orange-400 font-bold">-{loss.rate.toFixed(2)}/s</span>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
