/**
 * Core game entity types for Necroconomics
 * Single source of truth for all game data structures
 */

export type GamePhase = 'early' | 'mid' | 'late' | 'endgame';
export type UnitType = 'skeleton' | 'zombie' | 'ghoul' | 'ghost' | 'vampire';
export type BuildingType = 'morgue' | 'bone_mill' | 'necro_factory' | 'ritual_chamber' | 'decay_pit' | 'graveyard';
export type ResourceType = 
  | 'corpse' 
  | 'bone' 
  | 'flesh' 
  | 'soul_residue' 
  | 'necrotic_cement' 
  | 'biomatter_fuel' 
  | 'magic_battery' 
  | 'ritual_energy';

export type EventSeverity = 'info' | 'warning' | 'crisis';
export type EventType = 'crisis' | 'milestone' | 'flavor';

// ============ RESOURCES ============
export interface Resources {
  corpse: number;
  bone: number;
  flesh: number;
  soul_residue: number;
  necrotic_cement: number;
  biomatter_fuel: number;
  magic_battery: number;
  ritual_energy: number;
}

export interface ResourceRates extends Record<string, number> {
  // Rates per second for each resource
}

// ============ UNITS ============
export interface Unit {
  id: string;
  type: UnitType;
  freshness: number; // 0-100, how fresh the corpse is
  efficiency: number; // 0-1, work efficiency multiplier
  decay_rate: number; // per second
  insanity_risk: number; // 0-1, risk of going rogue
  created_at: number; // timestamp
  maintenance_cost: Partial<Resources>;
  assigned_to?: string; // building ID if assigned, undefined if unassigned
}

// ============ BUILDINGS ============
export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  efficiency: number;
  production_rate: Partial<Resources>; // per second
  maintenance_cost: Partial<Resources>; // per second
  is_active: boolean;
  created_at: number;
  assigned_units: string[]; // unit IDs assigned to this building
}

// ============ PRODUCTION CHAINS ============
export interface ProductionChain {
  id: string;
  name: string;
  input: Partial<Resources>;
  output: Partial<Resources>;
  duration: number; // seconds
  assigned_units: string[]; // unit IDs
  is_active: boolean;
  efficiency: number;
}

// ============ GAME STATE ============
export interface GameState {
  // Core identifiers
  colony_name: string;
  save_id: string;
  user_id: string;

  // Resources
  resources: Resources;
  resourceRates: ResourceRates;

  // Colony entities
  units: Unit[];
  buildings: Building[];
  productionChains: ProductionChain[];

  // Unit cost tracking (increases with each unit created, decreases when unit dies)
  unitCostMultipliers: Record<UnitType, number>;
  unitCreatedCounts: Record<UnitType, number>; // Total ever created
  unitCurrentCounts: Record<UnitType, number>; // Currently alive

  // Game progression
  tick: number;
  lastSaved: number;
  gamePhase: GamePhase;
  totalCorpsesProcessed: number;

  // Statistics
  stats: {
    total_corpses_processed: number;
    total_undead_created: number;
    total_buildings_built: number;
    uptime_seconds: number;
  };
}

// ============ EVENTS ============
export interface GameEvent {
  id: string;
  save_id: string;
  event_type: EventType;
  severity: EventSeverity;
  payload: Record<string, any>;
  created_at: number;
}

// ============ UI STATE ============
export interface UIState {
  // Panel visibility
  panelVisibility: {
    resources: boolean;
    units: boolean;
    buildings: boolean;
    events: boolean;
  };

  // Notifications
  notifications: Array<{
    id: string;
    message: string;
    severity: EventSeverity;
    timestamp: number;
  }>;

  // Modals
  activeModal: string | null;
  modalData: Record<string, any>;

  // Selection
  selectedUnitId: string | null;
  selectedBuildingId: string | null;
}

// ============ GAME CONFIG ============
export const RESOURCE_NAMES: Record<ResourceType, string> = {
  corpse: 'Corpses',
  bone: 'Bone',
  flesh: 'Flesh',
  soul_residue: 'Soul Residue',
  necrotic_cement: 'Necrotic Cement',
  biomatter_fuel: 'Biomatter Fuel',
  magic_battery: 'Magic Battery',
  ritual_energy: 'Ritual Energy',
};

export const UNIT_NAMES: Record<UnitType, string> = {
  skeleton: 'Skeleton',
  zombie: 'Zombie',
  ghoul: 'Ghoul',
  ghost: 'Ghost',
  vampire: 'Vampire',
};

export const BUILDING_NAMES: Record<BuildingType, string> = {
  morgue: 'Morgue',
  bone_mill: 'Bone Mill',
  necro_factory: 'Necromantic Factory',
  ritual_chamber: 'Ritual Chamber',
  decay_pit: 'Decay Pit',
  graveyard: 'Graveyard',
};
