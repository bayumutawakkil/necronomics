/**
 * Debug utilities for development
 */

import { Building, Unit } from '@/types/game';
import { calculateUnitEfficiencyBonus, calculateMaintenanceMultiplier } from './calculations';

/**
 * Log building production details to console
 */
export function debugBuildingProduction(
  building: Building,
  assignedUnits: Unit[]
): void {
  const unitBonus = calculateUnitEfficiencyBonus(assignedUnits);
  const totalEfficiency = building.efficiency + unitBonus;
  const maintenanceMultiplier = calculateMaintenanceMultiplier(unitBonus);

  console.group(`🏭 ${building.type} (${building.id})`);
  console.log('Status:', building.is_active ? '✅ Active' : '❌ Halted');
  console.log('Assigned Units:', assignedUnits.length);
  console.log('Base Efficiency:', building.efficiency.toFixed(2));
  console.log('Unit Bonus:', `+${unitBonus.toFixed(2)}`);
  console.log('Total Efficiency:', totalEfficiency.toFixed(2));
  console.log('Maintenance Multiplier:', `${maintenanceMultiplier.toFixed(2)}x`);
  
  console.group('📊 Production Rates');
  Object.entries(building.production_rate).forEach(([resource, rate]) => {
    if (rate && rate > 0) {
      const scaled = rate * totalEfficiency;
      console.log(`  ${resource}: ${rate.toFixed(2)} → ${scaled.toFixed(2)}/s (+${((scaled/rate - 1) * 100).toFixed(0)}%)`);
    }
  });
  console.groupEnd();

  console.group('💰 Maintenance Costs');
  Object.entries(building.maintenance_cost).forEach(([resource, cost]) => {
    if (cost && cost > 0) {
      const scaled = cost * maintenanceMultiplier;
      console.log(`  ${resource}: ${cost.toFixed(2)} → ${scaled.toFixed(2)}/s (+${((scaled/cost - 1) * 100).toFixed(0)}%)`);
    }
  });
  console.groupEnd();

  console.group('👥 Assigned Units');
  assignedUnits.forEach(unit => {
    console.log(`  ${unit.type} (${unit.id.slice(0, 8)}): efficiency ${unit.efficiency.toFixed(2)}, freshness ${unit.freshness.toFixed(0)}%`);
  });
  console.groupEnd();

  console.groupEnd();
}

/**
 * Log all buildings production summary
 */
export function debugAllBuildings(
  buildings: Building[],
  units: Unit[]
): void {
  console.group('🏭 All Buildings Production Summary');
  
  buildings.forEach(building => {
    const assignedUnits = (building.assigned_units ?? [])
      .map(id => units.find(u => u.id === id))
      .filter((u): u is Unit => u !== undefined);
    
    debugBuildingProduction(building, assignedUnits);
  });
  
  console.groupEnd();
}

/**
 * Calculate and log resource flow analysis
 */
export function debugResourceFlow(
  buildings: Building[],
  units: Unit[]
): void {
  const flow: Record<string, { production: number; consumption: number }> = {};

  buildings.forEach(building => {
    if (!building.is_active) return;

    const assignedUnits = (building.assigned_units ?? [])
      .map(id => units.find(u => u.id === id))
      .filter((u): u is Unit => u !== undefined);

    const unitBonus = calculateUnitEfficiencyBonus(assignedUnits);
    const totalEfficiency = building.efficiency + unitBonus;
    const maintenanceMultiplier = calculateMaintenanceMultiplier(unitBonus);

    // Production
    Object.entries(building.production_rate).forEach(([resource, rate]) => {
      if (rate && rate > 0) {
        flow[resource] = flow[resource] || { production: 0, consumption: 0 };
        flow[resource].production += rate * totalEfficiency;
      }
    });

    // Consumption
    Object.entries(building.maintenance_cost).forEach(([resource, cost]) => {
      if (cost && cost > 0) {
        flow[resource] = flow[resource] || { production: 0, consumption: 0 };
        flow[resource].consumption += cost * maintenanceMultiplier;
      }
    });
  });

  console.group('📊 Resource Flow Analysis');
  Object.entries(flow).forEach(([resource, { production, consumption }]) => {
    const net = production - consumption;
    const emoji = net > 0 ? '📈' : net < 0 ? '📉' : '⚖️';
    console.log(
      `${emoji} ${resource}:`,
      `+${production.toFixed(2)}/s`,
      `-${consumption.toFixed(2)}/s`,
      `= ${net >= 0 ? '+' : ''}${net.toFixed(2)}/s`
    );
  });
  console.groupEnd();
}

/**
 * Export debug functions to window for console access
 */
export function enableDebugMode(): void {
  if (typeof window !== 'undefined') {
    (window as any).necroDebug = {
      building: debugBuildingProduction,
      allBuildings: debugAllBuildings,
      resourceFlow: debugResourceFlow,
    };
    console.log('🔧 Debug mode enabled! Use window.necroDebug');
    console.log('  - necroDebug.allBuildings(buildings, units)');
    console.log('  - necroDebug.resourceFlow(buildings, units)');
  }
}
