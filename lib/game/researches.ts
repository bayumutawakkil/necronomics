/**
 * Research definitions
 */

import { Research } from '@/types/research';

export const RESEARCHES: Record<string, Research> = {
  // ===== EFFICIENCY TREE =====
  basic_necromancy: {
    id: 'basic_necromancy',
    name: 'Basic Necromancy',
    description: 'Improve skeleton efficiency by 20%',
    category: 'efficiency',
    icon: '📚',
    cost: { bone: 50 },
    prerequisites: [],
    duration: 30,
    effects: {
      unitEfficiencyBonus: { skeleton: 0.2 },
    },
  },
  
  advanced_reanimation: {
    id: 'advanced_reanimation',
    name: 'Advanced Reanimation',
    description: 'Improve zombie efficiency by 25%',
    category: 'efficiency',
    icon: '🧪',
    cost: { bone: 100, flesh: 50 },
    prerequisites: ['basic_necromancy'],
    requiredCorpsesProcessed: 50,
    duration: 60,
    effects: {
      unitEfficiencyBonus: { zombie: 0.25 },
    },
  },
  
  spectral_mastery: {
    id: 'spectral_mastery',
    name: 'Spectral Mastery',
    description: 'Improve ghost efficiency by 15%',
    category: 'efficiency',
    icon: '👻',
    cost: { soul_residue: 50, bone: 150 },
    prerequisites: ['advanced_reanimation'],
    requiredBuildingsBuilt: 5,
    duration: 90,
    effects: {
      unitEfficiencyBonus: { ghost: 0.15 },
    },
  },
  
  // ===== PRODUCTION TREE =====
  efficient_harvesting: {
    id: 'efficient_harvesting',
    name: 'Efficient Harvesting',
    description: 'Morgues produce 50% more bone',
    category: 'production',
    icon: '⚰️',
    cost: { bone: 80 },
    prerequisites: [],
    duration: 45,
    effects: {
      buildingProductionMultiplier: { morgue: 1.5 },
    },
  },
  
  industrial_processing: {
    id: 'industrial_processing',
    name: 'Industrial Processing',
    description: 'Bone Mills produce 40% more flesh',
    category: 'production',
    icon: '⚙️',
    cost: { bone: 150, flesh: 80 },
    prerequisites: ['efficient_harvesting'],
    duration: 60,
    effects: {
      buildingProductionMultiplier: { bone_mill: 1.4 },
    },
  },
  
  mass_production: {
    id: 'mass_production',
    name: 'Mass Production',
    description: 'All buildings produce 25% more',
    category: 'production',
    icon: '🏭',
    cost: { bone: 300, flesh: 200, soul_residue: 50 },
    prerequisites: ['industrial_processing'],
    requiredBuildingsBuilt: 10,
    duration: 120,
    effects: {
      buildingProductionMultiplier: {
        morgue: 1.25,
        bone_mill: 1.25,
        necro_factory: 1.25,
        ritual_chamber: 1.25,
        decay_pit: 1.25,
        graveyard: 1.25,
      },
    },
  },
  
  // ===== UNITS TREE =====
  preservation_techniques: {
    id: 'preservation_techniques',
    name: 'Preservation Techniques',
    description: 'Reduce skeleton decay rate by 50%',
    category: 'units',
    icon: '🧊',
    cost: { bone: 60, flesh: 30 },
    prerequisites: [],
    duration: 40,
    effects: {
      decayRateReduction: { skeleton: 0.5 },
    },
  },
  
  reinforced_bodies: {
    id: 'reinforced_bodies',
    name: 'Reinforced Bodies',
    description: 'Reduce zombie decay rate by 40%',
    category: 'units',
    icon: '🛡️',
    cost: { bone: 120, flesh: 80 },
    prerequisites: ['preservation_techniques'],
    duration: 60,
    effects: {
      decayRateReduction: { zombie: 0.4 },
    },
  },
  
  eternal_binding: {
    id: 'eternal_binding',
    name: 'Eternal Binding',
    description: 'Reduce all unit decay rates by 30%',
    category: 'units',
    icon: '⛓️',
    cost: { bone: 250, soul_residue: 100 },
    prerequisites: ['reinforced_bodies'],
    requiredCorpsesProcessed: 200,
    duration: 90,
    effects: {
      decayRateReduction: {
        skeleton: 0.3,
        zombie: 0.3,
        ghoul: 0.3,
        ghost: 0.3,
        vampire: 0.3,
      },
    },
  },
  
  // ===== BUILDINGS TREE =====
  expanded_facilities: {
    id: 'expanded_facilities',
    name: 'Expanded Facilities',
    description: 'Increase max units per building to 7',
    category: 'buildings',
    icon: '📐',
    cost: { bone: 100, flesh: 50 },
    prerequisites: [],
    duration: 50,
    effects: {
      maxUnitsIncrease: 2,
    },
  },
  
  optimized_workflow: {
    id: 'optimized_workflow',
    name: 'Optimized Workflow',
    description: 'Reduce building maintenance costs by 25%',
    category: 'buildings',
    icon: '📊',
    cost: { bone: 180, flesh: 100 },
    prerequisites: ['expanded_facilities'],
    duration: 70,
    effects: {
      maintenanceReduction: 0.25,
    },
  },
  
  mega_structures: {
    id: 'mega_structures',
    name: 'Mega Structures',
    description: 'Increase max units per building to 10',
    category: 'buildings',
    icon: '🏗️',
    cost: { bone: 400, flesh: 250, soul_residue: 100 },
    prerequisites: ['optimized_workflow'],
    requiredBuildingsBuilt: 15,
    duration: 120,
    effects: {
      maxUnitsIncrease: 3,
    },
  },
  
  // ===== COST REDUCTION TREE =====
  efficient_necromancy: {
    id: 'efficient_necromancy',
    name: 'Efficient Necromancy',
    description: 'Reduce skeleton creation cost by 20%',
    category: 'units',
    icon: '💰',
    cost: { bone: 70 },
    prerequisites: [],
    duration: 35,
    effects: {
      unitCostReduction: { skeleton: 0.2 },
    },
  },
  
  bulk_reanimation: {
    id: 'bulk_reanimation',
    name: 'Bulk Reanimation',
    description: 'Reduce zombie creation cost by 20%',
    category: 'units',
    icon: '💸',
    cost: { bone: 140, flesh: 70 },
    prerequisites: ['efficient_necromancy'],
    duration: 55,
    effects: {
      unitCostReduction: { zombie: 0.2 },
    },
  },
};

export const RESEARCH_CATEGORIES = {
  efficiency: { name: 'Efficiency', icon: '⚡', color: '#8b5cf6' },
  production: { name: 'Production', icon: '🏭', color: '#22c55e' },
  units: { name: 'Units', icon: '🦴', color: '#d6cfbc' },
  buildings: { name: 'Buildings', icon: '🏗️', color: '#d97706' },
};
