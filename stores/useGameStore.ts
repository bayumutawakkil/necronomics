'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { GameState, Resources, Unit, Building, ProductionChain } from '@/types/game';

const INITIAL_RESOURCES: Resources = {
  corpse: 10,
  bone: 0,
  flesh: 0,
  soul_residue: 0,
  necrotic_cement: 0,
  biomatter_fuel: 0,
  magic_battery: 0,
  ritual_energy: 0,
};

const INITIAL_STATE: GameState = {
  colony_name: 'New Colony',
  save_id: '',
  user_id: '',
  resources: INITIAL_RESOURCES,
  resourceRates: {},
  units: [],
  buildings: [],
  productionChains: [],
  tick: 0,
  lastSaved: Date.now(),
  gamePhase: 'early',
  totalCorpsesProcessed: 0,
  stats: {
    total_corpses_processed: 0,
    total_undead_created: 0,
    total_buildings_built: 0,
    uptime_seconds: 0,
  },
};

interface GameStore extends GameState {
  // Resource management
  addResource: (type: keyof Resources, amount: number) => void;
  removeResource: (type: keyof Resources, amount: number) => boolean;
  hasResources: (resources: Partial<Resources>) => boolean;

  // Unit management
  addUnit: (unit: Unit) => void;
  removeUnit: (unitId: string) => void;
  updateUnit: (unitId: string, updates: Partial<Unit>) => void;
  assignUnitToBuilding: (unitId: string, buildingId: string) => boolean;
  unassignUnit: (unitId: string) => void;

  // Building management
  addBuilding: (building: Building) => void;
  removeBuilding: (buildingId: string) => void;
  updateBuilding: (buildingId: string, updates: Partial<Building>) => void;

  // Game loop
  processTick: () => void;
  processDecay: () => void;

  // State management
  resetGame: () => void;
  loadGame: (state: Partial<GameState>) => void;

  // Supabase persistence
  setSaveId: (saveId: string, userId: string) => void;
  getSaveData: () => GameState;
}

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      ...INITIAL_STATE,

      // Resource management
      addResource: (type, amount) =>
        set((state) => {
          state.resources[type] += amount;
        }),

      removeResource: (type, amount) => {
        const state = get();
        if (state.resources[type] >= amount) {
          set((s) => {
            s.resources[type] -= amount;
          });
          return true;
        }
        return false;
      },

      hasResources: (resources) => {
        const state = get();
        return Object.entries(resources).every(
          ([type, amount]) =>
            state.resources[type as keyof Resources] >= (amount || 0)
        );
      },

      // Unit management
      addUnit: (unit) =>
        set((state) => {
          state.units.push(unit);
          state.stats.total_undead_created += 1;
        }),

      removeUnit: (unitId) =>
        set((state) => {
          // Unassign if assigned to a building
          state.buildings.forEach((b) => {
            if (b.assigned_units) {
              b.assigned_units = b.assigned_units.filter((id) => id !== unitId);
            }
          });
          state.units = state.units.filter((u) => u.id !== unitId);
        }),

      updateUnit: (unitId, updates) =>
        set((state) => {
          const unit = state.units.find((u) => u.id === unitId);
          if (unit) {
            Object.assign(unit, updates);
          }
        }),

      // Building management
      addBuilding: (building) =>
        set((state) => {
          state.buildings.push({ ...building, assigned_units: [] });
          state.stats.total_buildings_built += 1;
        }),

      removeBuilding: (buildingId) =>
        set((state) => {
          state.buildings = state.buildings.filter((b) => b.id !== buildingId);
        }),

      updateBuilding: (buildingId, updates) =>
        set((state) => {
          const building = state.buildings.find((b) => b.id === buildingId);
          if (building) {
            Object.assign(building, updates);
          }
        }),

      assignUnitToBuilding: (unitId, buildingId) => {
        const state = get();
        const unit = state.units.find((u) => u.id === unitId);
        const building = state.buildings.find((b) => b.id === buildingId);

        if (!unit || !building) return false;

        set((s) => {
          const u = s.units.find((x) => x.id === unitId);
          if (u) u.assigned_to = buildingId;
          const b = s.buildings.find((x) => x.id === buildingId);
          if (b && !(b.assigned_units ?? []).includes(unitId)) {
            b.assigned_units = b.assigned_units ?? [];
            b.assigned_units.push(unitId);
          }
        });
        return true;
      },

      unassignUnit: (unitId) =>
        set((state) => {
          const unit = state.units.find((u) => u.id === unitId);
          if (unit) {
            const buildingId = unit.assigned_to;
            if (buildingId) {
              const building = state.buildings.find((b) => b.id === buildingId);
              if (building) {
                building.assigned_units = building.assigned_units.filter((id) => id !== unitId);
              }
            }
            unit.assigned_to = undefined;
          }
        }),

      // Game loop
      processTick: () => {
        set((state) => {
          state.tick += 1;

          // Update uptime
          state.stats.uptime_seconds += 1;

          // Process building production (every tick)
          state.buildings.forEach((building) => {
            if (building.is_active) {
              // Guard: assigned_units may be undefined on old persisted saves
              const assignedUnits: string[] = building.assigned_units ?? [];

              // Base efficiency + sum of assigned unit efficiencies
              let totalEfficiency = building.efficiency;
              assignedUnits.forEach((unitId) => {
                const unit = state.units.find((u) => u.id === unitId);
                if (unit) {
                  totalEfficiency += unit.efficiency;
                }
              });

              // Deduct maintenance/input costs first
              let canProduce = true;
              Object.entries(building.maintenance_cost).forEach(([resource, cost]) => {
                if (cost && cost > 0) {
                  const available = state.resources[resource as keyof typeof state.resources];
                  if (available < cost) {
                    canProduce = false;
                  } else {
                    state.resources[resource as keyof typeof state.resources] -= cost;
                  }
                }
              });

              // Produce output only if inputs were available
              if (canProduce) {
                Object.entries(building.production_rate).forEach(([resource, rate]) => {
                  if (rate && rate > 0) {
                    const production = rate * totalEfficiency;
                    state.resources[resource as keyof typeof state.resources] += production;
                  }
                });
              }
            }
          });

          // Process unit decay and maintenance
          state.units.forEach((unit) => {
            // Decay freshness
            unit.freshness = Math.max(0, unit.freshness - unit.decay_rate);

            // Deduct maintenance cost — clamp to 0, never go negative
            Object.entries(unit.maintenance_cost || {}).forEach(([resource, cost]) => {
              const key = resource as keyof typeof state.resources;
              state.resources[key] = Math.max(0, state.resources[key] - cost);
            });

            // Dead units (freshness = 0) drop resources
            if (unit.freshness <= 0) {
              state.resources.bone += 2;
              state.resources.flesh += 3;
            }
          });

          // Remove dead units
          state.units = state.units.filter((u) => u.freshness > 0);

          // Natural corpse generation (1% chance per tick)
          if (Math.random() < 0.01) {
            state.resources.corpse += 1;
          }

          // Update game phase based on corpses processed
          const processed = state.stats.total_corpses_processed;
          if (processed >= 10000) state.gamePhase = 'endgame';
          else if (processed >= 1000) state.gamePhase = 'late';
          else if (processed >= 100) state.gamePhase = 'mid';
          else state.gamePhase = 'early';

          // Auto-save timestamp every 60 ticks
          if (state.tick % 60 === 0) {
            state.lastSaved = Date.now();
          }
        });
      },

      processDecay: () => {
        set((state) => {
          // Process decay calculations
          // This is called as part of processTick
        });
      },

      // State management
      resetGame: () => set(INITIAL_STATE),

      loadGame: (partialState) =>
        set((state) => {
          Object.assign(state, partialState);
        }),

      // Supabase persistence
      setSaveId: (saveId, userId) =>
        set((state) => {
          state.save_id = saveId;
          state.user_id = userId;
        }),

      getSaveData: () => get(),
    })),
    {
      name: 'necroconomics-game-state',
      version: 1,
    }
  )
);

// Selectors to prevent unnecessary re-renders
export const selectResources = (state: GameStore) => state.resources;
export const selectUnits = (state: GameStore) => state.units;
export const selectBuildings = (state: GameStore) => state.buildings;
export const selectGamePhase = (state: GameStore) => state.gamePhase;
export const selectStats = (state: GameStore) => state.stats;
