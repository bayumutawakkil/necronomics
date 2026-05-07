/**
 * Game constants and configuration
 */

export const GAME_CONFIG = {
  TICK_INTERVAL: 1000, // 1 second per tick
  AUTO_SAVE_INTERVAL: 60, // Save every 60 ticks (60 seconds)
  OFFLINE_PROGRESS_CAP: 28800, // Max 8 hours of offline progress
  NOTIFICATION_TIMEOUT: 5000, // Auto-dismiss notifications after 5s
  // Progression unlocks
  UNLOCK_ZOMBIE: 50,   // Unlock zombie after 50 corpses processed
  UNLOCK_GHOST: 5,     // Unlock ghost after 5 buildings built
  UNLOCK_VAMPIRE: 10,  // Unlock vampire after 10 buildings built
  // Unit assignment caps per building
  MAX_UNITS_PER_BUILDING: 5,
};

export const RESOURCE_ICONS: Record<string, string> = {
  corpse: '💀',
  bone: '🦴',
  flesh: '🩸',
  soul_residue: '👻',
  necrotic_cement: '🧱',
  biomatter_fuel: '⚗️',
  magic_battery: '🔋',
  ritual_energy: '✨',
};

export const UNIT_ICONS: Record<string, string> = {
  skeleton: '🦴',
  zombie: '🧟',
  ghoul: '👹',
  ghost: '👻',
  vampire: '🧛',
};


export const BUILDING_ICONS: Record<string, string> = {
  morgue: '⚰️',
  bone_mill: '⚙️',
  necro_factory: '🏭',
  ritual_chamber: '🕯️',
  decay_pit: '🪦',
};

// Default unit stats per type
export const UNIT_STATS = {
  skeleton: {
    efficiency: 0.8,
    decay_rate: 0.02,
    insanity_risk: 0.1,
    maintenance_cost: { bone: 0.1 },
  },
  zombie: {
    efficiency: 0.6,
    decay_rate: 0.05,
    insanity_risk: 0.15,
    maintenance_cost: { bone: 0.08 },
  },
  ghoul: {
    efficiency: 0.7,
    decay_rate: 0.03,
    insanity_risk: 0.2,
    maintenance_cost: { bone: 0.12 },
  },
  ghost: {
    efficiency: 0.9,
    decay_rate: 0.01,
    insanity_risk: 0.05,
    maintenance_cost: { bone: 0.14 },
  },
  vampire: {
    efficiency: 1.0,
    decay_rate: 0.0,
    insanity_risk: 0.25,
    maintenance_cost: { bone: 0.25 },
  },
};

// Building production and maintenance
export const BUILDING_STATS = {
  morgue: {
    cost: 30,
    // Skeletons assigned here boost bone production by their efficiency
    production_rate: { bone: 0.5 },
    maintenance_cost: { bone: 0.3 },
    preferred_unit: 'skeleton' as const,
    unit_bonus_desc: 'Each skeleton boosts bone output',
  },
  bone_mill: {
    cost: 50,
    // Consumes 5 bone/s, produces 2 flesh/s (base). Zombies boost flesh output.
    production_rate: { flesh: 2.0 },
    maintenance_cost: { bone: 5.0 }, // bone consumed as input
    preferred_unit: 'zombie' as const,
    unit_bonus_desc: 'Each zombie boosts flesh output',
  },
  necro_factory: {
    cost: 100,
    production_rate: { soul_residue: 0.2 },
    maintenance_cost: { bone: 0.5 },
    preferred_unit: 'ghost' as const,
    unit_bonus_desc: 'Each ghost boosts soul residue output',
  },
  ritual_chamber: {
    cost: 150,
    production_rate: { ritual_energy: 0.1 },
    maintenance_cost: { bone: 0.8 },
    preferred_unit: 'vampire' as const,
    unit_bonus_desc: 'Each vampire boosts ritual energy output',
  },
  decay_pit: {
    cost: 200,
    production_rate: { biomatter_fuel: 0.15 },
    maintenance_cost: { bone: 1.0 },
    preferred_unit: 'ghoul' as const,
    unit_bonus_desc: 'Each ghoul boosts biomatter output',
  },
};
