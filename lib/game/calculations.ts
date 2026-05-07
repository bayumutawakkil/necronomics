/**
 * Pure game calculation functions
 * No side effects, all pure functions
 */

import { Resources, Unit } from '@/types/game';
import { UNIT_STATS } from './constants';

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
