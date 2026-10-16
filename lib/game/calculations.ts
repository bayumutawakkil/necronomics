/**
 * Pure game calculation functions
 * No side effects, all pure functions
 */

import { BuildingType, Resources, Unit, UnitType, Building } from '@/types/game';
import { UNIT_STATS, BUILDING_STATS } from './constants';
import { RESEARCHES } from './researches';

type CompletedResearches = string[];

export function getUnitEffectiveStats(
  unitType: UnitType,
  completedResearches: CompletedResearches = [],
) {
  const stats = UNIT_STATS[unitType];
  const maintenanceCost: Partial<Resources> = { ...stats.maintenance_cost };
  const baseCost: Partial<Resources> = { ...stats.base_cost };
  const effectiveStats = {
    ...stats,
    maintenance_cost: maintenanceCost,
    base_cost: baseCost,
  };

  completedResearches.forEach((researchId) => {
    const effects = RESEARCHES[researchId]?.effects;
    if (!effects) return;

    const efficiencyBonus = effects.unitEfficiencyBonus?.[unitType];
    if (efficiencyBonus) {
      effectiveStats.efficiency += efficiencyBonus;
    }

    const decayReduction = effects.decayRateReduction?.[unitType];
    if (decayReduction) {
      effectiveStats.decay_rate *= 1 - decayReduction;
    }

    const costReduction = effects.unitCostReduction?.[unitType];
    if (costReduction) {
      Object.entries(effectiveStats.base_cost).forEach(([resource, cost]) => {
        if (cost) {
          effectiveStats.base_cost[resource as keyof Resources] = cost * (1 - costReduction);
        }
      });
    }
  });

  return effectiveStats;
}

export function getBuildingEffectiveStats(
  buildingType: BuildingType,
  completedResearches: CompletedResearches = [],
) {
  const stats = BUILDING_STATS[buildingType];
  const productionRate: Partial<Resources> = { ...stats.production_rate };
  const maintenanceCost: Partial<Resources> = { ...stats.maintenance_cost };
  const effectiveStats = {
    ...stats,
    production_rate: productionRate,
    maintenance_cost: maintenanceCost,
  };

  completedResearches.forEach((researchId) => {
    const effects = RESEARCHES[researchId]?.effects;
    if (!effects) return;

    const productionMultiplier = effects.buildingProductionMultiplier?.[buildingType];
    if (productionMultiplier) {
      Object.entries(effectiveStats.production_rate).forEach(([resource, rate]) => {
        if (rate) {
          effectiveStats.production_rate[resource as keyof Resources] = rate * productionMultiplier;
        }
      });
    }

    if (effects.maintenanceReduction) {
      Object.entries(effectiveStats.maintenance_cost).forEach(([resource, cost]) => {
        if (cost) {
          effectiveStats.maintenance_cost[resource as keyof Resources] =
            cost * (1 - effects.maintenanceReduction!);
        }
      });
    }
  });

  return {
    ...effectiveStats,
    maxUnits: getMaxUnitsPerBuilding(completedResearches),
  };
}

export function getMaxUnitsPerBuilding(completedResearches: CompletedResearches = []): number {
  return 5 + completedResearches.reduce(
    (total, researchId) => total + (RESEARCHES[researchId]?.effects.maxUnitsIncrease ?? 0),
    0,
  );
}

/**
 * Calculate total resource rates per second from all buildings and units
 */
export function calculateTotalResourceRates(
  buildings: Building[],
  units: Unit[],
  completedResearches: CompletedResearches = [],
): Partial<Resources> {
  const rates: Partial<Resources> = {};

  // Calculate building production and consumption
  buildings.forEach((building) => {
    if (!building.is_active) return;

    // Get assigned units for this building
    const assignedUnits = (building.assigned_units || [])
      .map(id => units.find(u => u.id === id))
      .filter((u): u is Unit => u !== undefined);

    // Calculate efficiency bonus from assigned units
    const buildingStats = getBuildingEffectiveStats(building.type, completedResearches);
    const effectiveUnits = assignedUnits.map((unit) => ({
      ...unit,
      ...getUnitEffectiveStats(unit.type, completedResearches),
    }));
    const unitEfficiencyBonus = calculateUnitEfficiencyBonus(effectiveUnits);
    const totalEfficiency = building.efficiency + unitEfficiencyBonus;
    
    // Calculate maintenance multiplier (input cost scales up)
    const maintenanceMultiplier = calculateMaintenanceMultiplier(unitEfficiencyBonus);

    // Add production
    Object.entries(buildingStats.production_rate).forEach(([resource, rate]) => {
      if (rate && rate > 0) {
        const production = rate * totalEfficiency;
        rates[resource as keyof Resources] = (rates[resource as keyof Resources] || 0) + production;
      }
    });

    // Subtract maintenance cost (consumed resources)
    Object.entries(buildingStats.maintenance_cost).forEach(([resource, cost]) => {
      if (cost && cost > 0) {
        const scaledCost = cost * maintenanceMultiplier;
        rates[resource as keyof Resources] = (rates[resource as keyof Resources] || 0) - scaledCost;
      }
    });
  });

  // Calculate unit maintenance costs
  units.forEach((unit) => {
    const unitStats = getUnitEffectiveStats(unit.type, completedResearches);
    Object.entries(unitStats.maintenance_cost || {}).forEach(([resource, cost]) => {
      if (cost && cost > 0) {
        rates[resource as keyof Resources] = (rates[resource as keyof Resources] || 0) - cost;
      }
    });
  });

  return rates;
}

/**
 * Calculate resource generation for a tick
 */
export function calculateResourceGeneration(
  units: Unit[],
  baseRates: Partial<Resources>
): Partial<Resources> {
  const result: Partial<Resources> = {};

  // Calculate from units (simplified)
  units.forEach((unit) => {
    const stats = UNIT_STATS[unit.type];
    // Each unit generates some resources based on type and efficiency
    // This is a placeholder - actual values depend on game balance
  });

  return result;
}

/**
 * Calculate decay damage for a unit per tick
 */
export function calculateUnitDecay(unit: Unit, tickDuration: number = 1000): number {
  return (unit.decay_rate * tickDuration) / 1000;
}

/**
 * Calculate total maintenance cost per tick
 */
export function calculateMaintenanceCost(
  units: Unit[]
): Partial<Resources> {
  const result: Partial<Resources> = {};

  units.forEach((unit) => {
    Object.entries(unit.maintenance_cost || {}).forEach(([resource, cost]) => {
      result[resource as keyof Resources] =
        (result[resource as keyof Resources] || 0) + cost;
    });
  });

  return result;
}

/**
 * Calculate if a unit should go insane
 */
export function shouldUnitGoInsane(unit: Unit): boolean {
  const stats = UNIT_STATS[unit.type];
  const freshnessFactor = 1 - unit.freshness / 100;
  const actualRisk = stats.insanity_risk * (1 + freshnessFactor * 2);
  return Math.random() < actualRisk / 1000; // Per tick chance
}

/**
 * Calculate game phase based on progress
 */
export function calculateGamePhase(totalCorpsesProcessed: number): 'early' | 'mid' | 'late' | 'endgame' {
  if (totalCorpsesProcessed < 100) return 'early';
  if (totalCorpsesProcessed < 1000) return 'mid';
  if (totalCorpsesProcessed < 10000) return 'late';
  return 'endgame';
}

/**
 * Calculate offline progress ticks (capped)
 */
export function calculateOfflineProgress(
  lastSavedTime: number,
  maxOfflineTicks: number = 28800 // 8 hours
): number {
  const now = Date.now();
  const deltaMs = now - lastSavedTime;
  const deltaTicks = Math.floor(deltaMs / 1000);
  return Math.min(deltaTicks, maxOfflineTicks);
}

/**
 * Calculate efficiency multiplier for building level
 */
export function calculateBuildingEfficiency(level: number): number {
  // Each level gives 1.2x efficiency
  return Math.pow(1.2, level - 1);
}

export function calculateBuildingUpgradeCost(
  buildingType: BuildingType,
  newLevel: number,
): number {
  return Math.ceil(
    BUILDING_STATS[buildingType].cost *
      Math.pow(newLevel, 1.5),
  );
}

/**
 * Calculate total efficiency bonus from assigned units
 */
export function calculateUnitEfficiencyBonus(units: Unit[]): number {
  return units.reduce((sum, unit) => sum + unit.efficiency, 0);
}

/**
 * Calculate maintenance cost multiplier based on assigned units
 * More units = more input consumption (50% increase per unit efficiency point)
 */
export function calculateMaintenanceMultiplier(unitEfficiencyBonus: number): number {
  return 1 + (unitEfficiencyBonus * 0.5);
}

/**
 * Calculate building production rates with unit bonuses
 */
export function calculateBuildingProduction(
  baseRate: number,
  buildingEfficiency: number,
  assignedUnits: Unit[]
): number {
  const unitBonus = calculateUnitEfficiencyBonus(assignedUnits);
  const totalEfficiency = buildingEfficiency + unitBonus;
  return baseRate * totalEfficiency;
}

/**
 * Calculate building maintenance cost with unit scaling
 */
export function calculateBuildingMaintenance(
  baseCost: number,
  assignedUnits: Unit[]
): number {
  const unitBonus = calculateUnitEfficiencyBonus(assignedUnits);
  const multiplier = calculateMaintenanceMultiplier(unitBonus);
  return baseCost * multiplier;
}

/**
 * Calculate unit creation cost based on how many are currently alive
 * Cost increases by 10% for each unit of that type currently alive
 * When a unit dies, the cost decreases back
 */
export function calculateUnitCost(
  baseCost: Partial<Resources>,
  currentCount: number,
  costScaling: number = 1.1,
  completedResearches: CompletedResearches = [],
  unitType?: UnitType,
): Partial<Resources> {
  const multiplier = Math.pow(costScaling, currentCount);
  const scaledCost: Partial<Resources> = {};
  
  Object.entries(baseCost).forEach(([resource, amount]) => {
    if (amount) {
      scaledCost[resource as keyof Resources] = Math.ceil(amount * multiplier);
    }
  });

  if (unitType) {
    const effectiveCost = getUnitEffectiveStats(unitType, completedResearches).base_cost;
    Object.entries(effectiveCost).forEach(([resource, amount]) => {
      if (amount) {
        scaledCost[resource as keyof Resources] = Math.ceil(amount * multiplier);
      }
    });
  }
  
  return scaledCost;
}

export interface ResourceFlowItem {
  resource: keyof Resources;
  totalGained: number;
  totalSpent: number;
  gains: { source: string; rate: number }[];
  losses: { sink: string; rate: number }[];
}

/**
 * Calculates inflow and outflow rates for all game resources
 */
export function calculateResourceFlowBreakdown(
  buildings: Building[],
  units: Unit[]
): Record<keyof Resources, ResourceFlowItem> {
  const result: any = {};
  const resourcesList: (keyof Resources)[] = [
    'corpse', 'bone', 'flesh', 'soul_residue', 'necrotic_cement', 
    'biomatter_fuel', 'magic_battery', 'ritual_energy'
  ];
  
  resourcesList.forEach(res => {
    result[res] = {
      resource: res,
      totalGained: 0,
      totalSpent: 0,
      gains: [],
      losses: []
    };
  });

  const buildingTypeNames: Record<string, string> = {
    morgue: 'Morgue',
    bone_mill: 'Bone Mill',
    necro_factory: 'Necro Factory',
    ritual_chamber: 'Ritual Chamber',
    decay_pit: 'Decay Pit',
    graveyard: 'Graveyard'
  };

  // Group active buildings by type
  const activeBuildings = buildings.filter(b => b.is_active);
  const buildingsByType: Record<string, Building[]> = {};
  activeBuildings.forEach(b => {
    if (!buildingsByType[b.type]) {
      buildingsByType[b.type] = [];
    }
    buildingsByType[b.type].push(b);
  });

  Object.entries(buildingsByType).forEach(([bType, bList]) => {
    const count = bList.length;
    const firstB = bList[0];
    const bName = buildingTypeNames[bType] || bType;

    // Calculate aggregated workers assigned to buildings of this type
    const allAssignedUnitIds = bList.flatMap(b => b.assigned_units || []);
    const assignedUnits = allAssignedUnitIds
      .map(id => units.find(u => u.id === id))
      .filter((u): u is Unit => u !== undefined);

    const unitEfficiencyBonus = assignedUnits.reduce((sum, u) => sum + u.efficiency, 0);
    const totalEfficiency = (firstB.efficiency * count) + unitEfficiencyBonus;
    const maintenanceMultiplier = 1 + (unitEfficiencyBonus * 0.5);

    // Production (gains)
    Object.entries(firstB.production_rate).forEach(([res, rate]) => {
      if (rate && rate > 0) {
        const amount = rate * totalEfficiency;
        result[res].totalGained += amount;
        result[res].gains.push({
          source: `${bName} (${count}x)`,
          rate: amount
        });
      }
    });

    // Consumption (losses)
    Object.entries(firstB.maintenance_cost).forEach(([res, cost]) => {
      if (cost && cost > 0) {
        const amount = cost * maintenanceMultiplier;
        result[res].totalSpent += amount;
        result[res].losses.push({
          sink: `${bName} Input (${count}x)`,
          rate: amount
        });
      }
    });
  });

  // Units maintenance
  const unitsByType: Record<string, number> = {};
  units.forEach(u => {
    unitsByType[u.type] = (unitsByType[u.type] || 0) + 1;
  });

  const unitTypeLabels: Record<string, string> = {
    skeleton: 'Skeletons',
    zombie: 'Zombies',
    ghoul: 'Ghouls',
    ghost: 'Ghosts',
    vampire: 'Vampires'
  };

  const defaultUnitMaintenance: Record<string, Record<string, number>> = {
    skeleton: { bone: 0.08 },
    zombie: { bone: 0.08 },
    ghoul: { bone: 0.10 },
    ghost: { bone: 0.12 },
    vampire: { bone: 0.15 }
  };

  Object.entries(unitsByType).forEach(([uType, count]) => {
    const label = unitTypeLabels[uType] || uType;
    const maint = defaultUnitMaintenance[uType] || {};
    Object.entries(maint).forEach(([res, cost]) => {
      const amount = cost * count;
      result[res].totalSpent += amount;
      result[res].losses.push({
        sink: `${label} Maintenance (${count}x)`,
        rate: amount
      });
    });
  });

  // Natural corpse generation: average of 1% chance per tick = 0.01 corpses/sec
  result['corpse'].totalGained += 0.01;
  result['corpse'].gains.push({
    source: 'Natural Spawning',
    rate: 0.01
  });

  return result;
}
