/**
 * Research system types
 */

import { Resources } from './game';

export type ResearchCategory = 'efficiency' | 'production' | 'units' | 'buildings';
export type ResearchStatus = 'locked' | 'available' | 'researching' | 'completed';

export interface Research {
  id: string;
  name: string;
  description: string;
  category: ResearchCategory;
  icon: string;
  
  // Requirements
  cost: Partial<Resources>;
  prerequisites: string[]; // IDs of required researches
  requiredCorpsesProcessed?: number;
  requiredBuildingsBuilt?: number;
  
  // Research time
  duration: number; // seconds
  
  // Effects (applied when completed)
  effects: {
    // Unit efficiency bonuses
    unitEfficiencyBonus?: Partial<Record<string, number>>;
    
    // Building production multipliers
    buildingProductionMultiplier?: Partial<Record<string, number>>;
    
    // Cost reductions
    unitCostReduction?: Partial<Record<string, number>>;
    buildingCostReduction?: Partial<Record<string, number>>;
    
    // Maintenance reductions
    maintenanceReduction?: number;
    
    // Decay rate reductions
    decayRateReduction?: Partial<Record<string, number>>;
    
    // Max units per building increase
    maxUnitsIncrease?: number;
    
    // Unlock new units/buildings
    unlocks?: string[];
  };
}

export interface ResearchProgress {
  researchId: string;
  startedAt: number;
  progress: number; // 0-100
}

export interface ResearchState {
  completedResearches: string[];
  currentResearch: ResearchProgress | null;
  availableResearches: string[];
}
