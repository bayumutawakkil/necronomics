'use client';

import { Building, Resources } from '@/types/game';
import { GAME_CONFIG } from '@/lib/game/constants';
import { RESEARCHES } from '@/lib/game/researches';
import {
  calculateBuildingEfficiency,
  calculateBuildingUpgradeCost,
  getBuildingEffectiveStats,
  getMaxUnitsPerBuilding,
  getUnitEffectiveStats,
} from '@/lib/game/calculations';
import { BuildingIcon, ResourceIcon, UnitIcon } from '@/components/ui/Icons';

interface BuildingCardProps {
  building: Building;
  assignedCount?: number;
  count?: number;
  onAssign?: (buildingType: string) => void;
  onUnassign?: (buildingType: string) => void;
  onUpgrade?: (buildingId: string) => void;
  completedResearches?: string[];
  resources?: Resources;
}

const BUILDING_META: Record<string, { name: string; color: string }> = {
  morgue:         { name: 'Morgue', color: 'text-amber-100' },
  bone_mill:      { name: 'Bone Mill', color: 'text-orange-400' },
  necro_factory:  { name: 'Necro Factory', color: 'text-violet-400' },
  ritual_chamber: { name: 'Ritual Chamber', color: 'text-rose-500' },
  decay_pit:      { name: 'Decay Pit', color: 'text-emerald-500' },
  graveyard:      { name: 'Graveyard', color: 'text-yellow-200' },
};

export function BuildingCard({
  building,
  assignedCount = 0,
  count = 1,
  onAssign,
  onUnassign,
  onUpgrade,
  completedResearches = [],
  resources,
}: BuildingCardProps) {
  const meta = BUILDING_META[building.type] ?? { name: building.type, color: 'text-slate-200' };
  const effectiveBuildingStats = getBuildingEffectiveStats(building.type, completedResearches);
  const prodEntries = Object.entries(effectiveBuildingStats.production_rate).filter(([, v]) => v && v > 0) as [string, number][];
  const maintEntries = Object.entries(effectiveBuildingStats.maintenance_cost).filter(([, v]) => v && v > 0) as [string, number][];
  
  const bStats = effectiveBuildingStats;
  const preferredUnit = bStats?.preferred_unit;
  const maxUnits = count * getMaxUnitsPerBuilding(completedResearches);

  // Efficiency and production multiplier math
  const avgUnitEfficiency = preferredUnit
    ? getUnitEffectiveStats(preferredUnit, completedResearches).efficiency
    : 0.8;
  const unitEfficiencyBonus = assignedCount * avgUnitEfficiency;
  const totalEfficiency = building.efficiency + unitEfficiencyBonus;
  const nextLevel = building.level + 1;
  const isMaxLevel = building.level >= GAME_CONFIG.MAX_BUILDING_LEVEL;
  const upgradeCost = isMaxLevel
    ? 0
    : calculateBuildingUpgradeCost(building.type, nextLevel);
  const nextEfficiency = isMaxLevel
    ? building.efficiency
    : calculateBuildingEfficiency(nextLevel);
  const nextTotalEfficiency = nextEfficiency + unitEfficiencyBonus;
  const maintenanceMultiplier = 1 + (unitEfficiencyBonus * 0.5);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-950/45 border border-slate-900 backdrop-blur-md hover:bg-slate-900/30 hover:border-violet-500/10 transition-all duration-300 shadow-md mb-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.07)]">
            <BuildingIcon name={building.type} size={22} />
          </span>
          <div className="flex flex-col">
            <span className={`text-sm font-bold uppercase tracking-wider font-display ${meta.color}`}>
              {meta.name}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Count: <span className="text-slate-300 font-bold">x{count}</span>
              <span className="mx-1 text-slate-700">|</span>
              Level <span className="text-slate-300 font-bold">
                {building.level}/{GAME_CONFIG.MAX_BUILDING_LEVEL}
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-900/60">
          <span className={`relative flex h-2 w-2`}>
            {building.is_active && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${building.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            {building.is_active ? 'Active' : 'Halted'}
          </span>
        </div>
      </div>

      {/* Production stats */}
      {(prodEntries.length > 0 || maintEntries.length > 0) && (
        <div className="flex flex-col gap-1.5 text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-900/60">
          {prodEntries.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[9px] uppercase tracking-widest font-bold font-display">Yields</span>
              <div className="flex gap-3">
                {prodEntries.map(([res, rate]) => (
                  <div key={res} className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                    <ResourceIcon name={res} size={14} />
                    <span>+{(rate * totalEfficiency * count).toFixed(1)}/s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 rounded-lg border border-violet-500/15 bg-violet-950/10 p-2.5 text-[10px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 uppercase tracking-widest font-bold">Efficiency</span>
              <span className="text-violet-300 font-bold">
                {building.efficiency.toFixed(2)}
                <span className="text-slate-500"> (base 1.0 × level)</span>
              </span>
            </div>
            {!isMaxLevel && prodEntries.length > 0 && (
              <div className="text-slate-400">
                Next level: <span className="text-emerald-400 font-bold">
                  +{(prodEntries[0][1] * nextTotalEfficiency * count).toFixed(1)}/s
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              {isMaxLevel ? (
                <span className="text-amber-400 font-bold uppercase tracking-wider">Maximum level</span>
              ) : (
                <span className={resources && resources.bone < upgradeCost ? 'text-rose-400' : 'text-amber-300'}>
                  Upgrade: {upgradeCost} bone
                </span>
              )}
              {!isMaxLevel && (
                <button
                  type="button"
                  onClick={() => onUpgrade?.(building.id)}
                  disabled={!resources || resources.bone < upgradeCost}
                  title={`Upgrade to level ${nextLevel} (${upgradeCost} bone)`}
                  className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-violet-300 transition-colors hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:border-rose-500/20 disabled:bg-rose-500/10 disabled:text-rose-400 disabled:opacity-80"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
          {prodEntries.length > 0 && maintEntries.length > 0 && <div className="h-[1px] w-full bg-slate-900" />}
          {maintEntries.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[9px] uppercase tracking-widest font-bold font-display">Costs</span>
              <div className="flex gap-3">
                {maintEntries.map(([res, cost]) => (
                  <div key={res} className="flex items-center gap-1 text-orange-400 font-mono font-bold">
                    <ResourceIcon name={res} size={14} />
                    <span>-{(cost * maintenanceMultiplier * count).toFixed(1)}/s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedResearches.length > 0 && (
            <div className="flex flex-col gap-1 text-[9px] font-mono">
              {(() => {
                const productionResearches = completedResearches
                  .map((id) => RESEARCHES[id])
                  .filter((research) => research?.effects.buildingProductionMultiplier?.[building.type]);
                const productionMultiplier = productionResearches.reduce(
                  (multiplier, research) =>
                    multiplier * (research.effects.buildingProductionMultiplier?.[building.type] ?? 1),
                  1,
                );

                return productionMultiplier > 1 ? (
                  <span className="text-emerald-400">
                    {meta.name}: {productionMultiplier.toFixed(2)}x ✓ from{' '}
                    {productionResearches.map((research) => research.name).join(', ')}
                  </span>
                ) : null;
              })()}
              {preferredUnit && (() => {
                const decayResearches = completedResearches
                  .map((id) => RESEARCHES[id])
                  .filter((research) => research?.effects.decayRateReduction?.[preferredUnit]);
                const decayReduction = decayResearches.reduce(
                  (reduction, research) =>
                    1 - (1 - reduction) * (1 - (research.effects.decayRateReduction?.[preferredUnit] ?? 0)),
                  0,
                );

                return decayReduction > 0 ? (
                  <span className="text-violet-300">
                    {preferredUnit}: {(decayReduction * 100).toFixed(0)}% decay reduction (research)
                  </span>
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}

      {/* Worker management */}
      {preferredUnit && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-mono px-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <UnitIcon name={preferredUnit} size={14} />
              <span className="uppercase tracking-widest font-bold font-display">Workers ({preferredUnit}s)</span>
            </div>
            <div className="font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900/60">
              <span className={assignedCount >= maxUnits ? 'text-amber-400' : 'text-emerald-400'}>{assignedCount}</span>
              <span className="text-slate-600">/{maxUnits}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onUnassign?.(building.type)}
              disabled={assignedCount <= 0}
              className="flex-1 py-1.5 text-[9px] uppercase tracking-widest font-bold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 cursor-pointer font-display"
            >
              Remove
            </button>
            <button
              onClick={() => onAssign?.(building.type)}
              disabled={assignedCount >= maxUnits}
              className="flex-1 py-1.5 text-[9px] uppercase tracking-widest font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 active:scale-95 cursor-pointer font-display"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {/* Worker efficiency bonuses */}
      {assignedCount > 0 && (
        <div className="text-[10px] text-blue-400 font-mono text-center flex items-center justify-center gap-1 bg-blue-950/20 border border-blue-900/20 rounded py-1">
          Labor Efficiency Bonus: <span className="font-bold">+{(unitEfficiencyBonus * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
