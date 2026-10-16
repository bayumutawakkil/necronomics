'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ResourceCard } from '@/components/ui/ResourceCard';
import { UnitCard } from '@/components/ui/UnitCard';
import { BuildingCard } from '@/components/ui/BuildingCard';
import { StatsPanel } from '@/components/ui/StatsPanel';
import { useGameStore } from '@/stores/useGameStore';
import { useResearchStore } from '@/stores/useResearchStore';
import { useUIStore } from '@/stores/useUIStore';
import { useGameLoop } from '@/lib/hooks/useGameLoop';
import { UNIT_STATS, BUILDING_STATS, GAME_CONFIG, UNIT_COST_SCALING } from '@/lib/game/constants';
import {
  calculateUnitCost,
  getMaxUnitsPerBuilding,
  getUnitEffectiveStats,
} from '@/lib/game/calculations';
import { Resources, Building, UnitType } from '@/types/game';
import { 
  CorpseIcon, BoneIcon, FleshIcon, SkeletonIcon, ZombieIcon, 
  GhoulIcon, GhostIcon, VampireIcon, MorgueIcon, BoneMillIcon, FactoryIcon, 
  RitualChamberIcon, DecayPitIcon, GraveyardIcon, WarningIcon, 
  InfoIcon, LockIcon, CloudIcon, ClipboardIcon, StructuresIcon,
  ArrowUpIcon, ArrowDownIcon
} from '@/components/ui/Icons';

export default function GamePage() {
  const { tick } = useGameLoop();
  const stats     = useGameStore((s) => s.stats);
  const units     = useGameStore((s) => s.units);
  const buildings = useGameStore((s) => s.buildings);
  const resources = useGameStore((s) => s.resources);
  const unitCurrentCounts = useGameStore((s) => s.unitCurrentCounts);
  const completedResearches = useResearchStore((s) => s.completedResearches);
  const saveId            = useGameStore((s) => s.save_id);
  const addResource         = useGameStore((s) => s.addResource);
  const removeResource      = useGameStore((s) => s.removeResource);
  const addUnit             = useGameStore((s) => s.addUnit);
  const addBuilding         = useGameStore((s) => s.addBuilding);
  const upgradeBuilding     = useGameStore((s) => s.upgradeBuilding);
  const assignUnitToBuilding = useGameStore((s) => s.assignUnitToBuilding);
  const unassignUnit        = useGameStore((s) => s.unassignUnit);
  const addNotification     = useUIStore((s) => s.addNotification);

  const [lastAction, setLastAction] = useState<string | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [cloudOpen, setCloudOpen] = useState(false);
  const [loadInputId, setLoadInputId] = useState('');
  
  // Supabase states
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Track which resources are in danger (went to 0 or below)
  const [dangerResources, setDangerResources] = useState<Set<keyof Resources>>(new Set());
  const prevResourcesRef = useRef<Resources>(resources);

  useEffect(() => {
    const prev = prevResourcesRef.current;
    const newDanger = new Set<keyof Resources>();
    (Object.keys(resources) as (keyof Resources)[]).forEach((key) => {
      const cur = resources[key];
      // Clamp: never show negative
      if (cur < 0) {
        useGameStore.setState((s) => ({
          resources: { ...s.resources, [key]: 0 },
        }));
      }
      // Flash if crossed zero from positive
      if (prev[key] > 0 && cur <= 0) {
        newDanger.add(key);
        addNotification(`Warning: ${key.replace(/_/g, ' ')} depleted!`, 'warning');
      }
    });
    if (newDanger.size > 0) {
      setDangerResources(newDanger);
      setTimeout(() => setDangerResources(new Set()), 1400);
    }
    prevResourcesRef.current = resources;
  }, [resources]);

  // Hook auto-sync with the game loop's 60-tick save frequency
  const lastSaved = useGameStore((s) => s.lastSaved);
  useEffect(() => {
    if (saveId && lastSaved > 0) {
      handleCloudSave(false); // Auto-sync silently
    }
  }, [lastSaved]);

  const pulse = (msg: string) => {
    setLastAction(msg);
    setTimeout(() => setLastAction(null), 1800);
  };

  /* ── progression flags ── */
  const canRaiseZombie  = stats.total_corpses_processed >= GAME_CONFIG.UNLOCK_ZOMBIE;
  const canRaiseGhost   = stats.total_buildings_built   >= GAME_CONFIG.UNLOCK_GHOST;
  const canRaiseVampire = stats.total_buildings_built   >= GAME_CONFIG.UNLOCK_VAMPIRE;

  /* ── action handlers ── */
  const handleHarvestCorpse = () => {
    addResource('corpse', 1);
    addNotification('Harvested 1 corpse!', 'info');
    pulse('CORPSE HARVESTED');
  };

  const handleButcherCorpse = () => {
    if (resources.corpse < 5) { addNotification('Need 5 corpses!', 'warning'); return; }
    removeResource('corpse', 5);
    addResource('bone', 8);
    addResource('flesh', 4);
    useGameStore.setState((s) => ({
      stats: { ...s.stats, total_corpses_processed: s.stats.total_corpses_processed + 5 },
      totalCorpsesProcessed: s.totalCorpsesProcessed + 5,
    }));
    addNotification('Butchered: 5 corpses -> 8 bone + 4 flesh', 'info');
    pulse('BUTCHERED');
  };

  const handleRaiseSkeleton = () => {
    const cost = calculateUnitCost(
      UNIT_STATS.skeleton.base_cost,
      unitCurrentCounts.skeleton,
      UNIT_COST_SCALING,
      completedResearches,
      'skeleton',
    );
    const canAfford = Object.entries(cost).every(([res, amt]) => resources[res as keyof Resources] >= (amt || 0));
    
    if (!canAfford) {
      const costStr = Object.entries(cost).map(([res, amt]) => `${amt} ${res}`).join(' + ');
      addNotification(`Need: ${costStr}`, 'warning');
      return;
    }
    
    // Deduct resources
    Object.entries(cost).forEach(([res, amt]) => {
      if (amt) removeResource(res as keyof Resources, amt);
    });
    
    useGameStore.setState((s) => ({
      stats: { ...s.stats, total_corpses_processed: s.stats.total_corpses_processed + 1 },
      totalCorpsesProcessed: s.totalCorpsesProcessed + 1,
    }));
    
    const sk = getUnitEffectiveStats('skeleton', completedResearches);
    addUnit({ 
      id: uuidv4(), 
      type: 'skeleton', 
      freshness: 100, 
      efficiency: sk.efficiency, 
      decay_rate: sk.decay_rate, 
      insanity_risk: sk.insanity_risk, 
      created_at: Date.now(), 
      maintenance_cost: sk.maintenance_cost 
    });
    addNotification('Skeleton raised! Assign to Morgue.', 'info');
    pulse('SKELETON RAISED');
  };

  const handleRaiseZombie = () => {
    if (!canRaiseZombie) { 
      addNotification(`Unlock at ${GAME_CONFIG.UNLOCK_ZOMBIE} corpses (${stats.total_corpses_processed}/${GAME_CONFIG.UNLOCK_ZOMBIE})`, 'warning'); 
      return; 
    }
    
    const cost = calculateUnitCost(
      UNIT_STATS.zombie.base_cost,
      unitCurrentCounts.zombie,
      UNIT_COST_SCALING,
      completedResearches,
      'zombie',
    );
    const canAfford = Object.entries(cost).every(([res, amt]) => resources[res as keyof Resources] >= (amt || 0));
    
    if (!canAfford) {
      const costStr = Object.entries(cost).map(([res, amt]) => `${amt} ${res}`).join(' + ');
      addNotification(`Need: ${costStr}`, 'warning');
      return;
    }
    
    // Deduct resources
    Object.entries(cost).forEach(([res, amt]) => {
      if (amt) removeResource(res as keyof Resources, amt);
    });
    
    useGameStore.setState((s) => ({
      stats: { ...s.stats, total_corpses_processed: s.stats.total_corpses_processed + 2 },
      totalCorpsesProcessed: s.totalCorpsesProcessed + 2,
    }));
    
    const zs = getUnitEffectiveStats('zombie', completedResearches);
    addUnit({ 
      id: uuidv4(), 
      type: 'zombie', 
      freshness: 100, 
      efficiency: zs.efficiency, 
      decay_rate: zs.decay_rate, 
      insanity_risk: zs.insanity_risk, 
      created_at: Date.now(), 
      maintenance_cost: zs.maintenance_cost 
    });
    addNotification('Zombie raised! Assign to Bone Mill.', 'info');
    pulse('ZOMBIE RAISED');
  };

  const handleRaiseGhoul = () => {
    const cost = calculateUnitCost(
      UNIT_STATS.ghoul.base_cost,
      unitCurrentCounts.ghoul,
      UNIT_COST_SCALING,
      completedResearches,
      'ghoul',
    );
    const canAfford = Object.entries(cost).every(
      ([res, amt]) => resources[res as keyof Resources] >= (amt || 0),
    );

    if (!canAfford) {
      const costStr = Object.entries(cost)
        .map(([res, amt]) => `${amt} ${res}`)
        .join(' + ');
      addNotification(`Need: ${costStr}`, 'warning');
      return;
    }

    Object.entries(cost).forEach(([res, amt]) => {
      if (amt) removeResource(res as keyof Resources, amt);
    });

    useGameStore.setState((s) => ({
      stats: { ...s.stats, total_corpses_processed: s.stats.total_corpses_processed + 3 },
      totalCorpsesProcessed: s.totalCorpsesProcessed + 3,
    }));

    const gs = getUnitEffectiveStats('ghoul', completedResearches);
    addUnit({
      id: uuidv4(),
      type: 'ghoul',
      freshness: 100,
      efficiency: gs.efficiency,
      decay_rate: gs.decay_rate,
      insanity_risk: gs.insanity_risk,
      created_at: Date.now(),
      maintenance_cost: gs.maintenance_cost,
    });
    addNotification('Ghoul raised! Assign to Decay Pit.', 'info');
    pulse('GHOUL RAISED');
  };

  const handleRaiseGhost = () => {
    if (!canRaiseGhost) { 
      addNotification(`Unlock at ${GAME_CONFIG.UNLOCK_GHOST} buildings (${stats.total_buildings_built}/${GAME_CONFIG.UNLOCK_GHOST})`, 'warning'); 
      return; 
    }
    
    const cost = calculateUnitCost(
      UNIT_STATS.ghost.base_cost,
      unitCurrentCounts.ghost,
      UNIT_COST_SCALING,
      completedResearches,
      'ghost',
    );
    const canAfford = Object.entries(cost).every(([res, amt]) => resources[res as keyof Resources] >= (amt || 0));
    
    if (!canAfford) {
      const costStr = Object.entries(cost).map(([res, amt]) => `${amt} ${res}`).join(' + ');
      addNotification(`Need: ${costStr}`, 'warning');
      return;
    }
    
    // Deduct resources
    Object.entries(cost).forEach(([res, amt]) => {
      if (amt) removeResource(res as keyof Resources, amt);
    });
    
    const gs = getUnitEffectiveStats('ghost', completedResearches);
    addUnit({ 
      id: uuidv4(), 
      type: 'ghost', 
      freshness: 100, 
      efficiency: gs.efficiency, 
      decay_rate: gs.decay_rate, 
      insanity_risk: gs.insanity_risk, 
      created_at: Date.now(), 
      maintenance_cost: gs.maintenance_cost 
    });
    addNotification('Ghost summoned! Assign to Necro Factory.', 'info');
    pulse('GHOST SUMMONED');
  };

  const handleRaiseVampire = () => {
    if (!canRaiseVampire) { 
      addNotification(`Unlock at ${GAME_CONFIG.UNLOCK_VAMPIRE} buildings (${stats.total_buildings_built}/${GAME_CONFIG.UNLOCK_VAMPIRE})`, 'warning'); 
      return; 
    }
    
    const cost = calculateUnitCost(
      UNIT_STATS.vampire.base_cost,
      unitCurrentCounts.vampire,
      UNIT_COST_SCALING,
      completedResearches,
      'vampire',
    );
    const canAfford = Object.entries(cost).every(([res, amt]) => resources[res as keyof Resources] >= (amt || 0));
    
    if (!canAfford) {
      const costStr = Object.entries(cost).map(([res, amt]) => `${amt} ${res}`).join(' + ');
      addNotification(`Need: ${costStr}`, 'warning');
      return;
    }
    
    // Deduct resources
    Object.entries(cost).forEach(([res, amt]) => {
      if (amt) removeResource(res as keyof Resources, amt);
    });
    
    const vs = getUnitEffectiveStats('vampire', completedResearches);
    addUnit({ 
      id: uuidv4(), 
      type: 'vampire', 
      freshness: 100, 
      efficiency: vs.efficiency, 
      decay_rate: vs.decay_rate, 
      insanity_risk: vs.insanity_risk, 
      created_at: Date.now(), 
      maintenance_cost: vs.maintenance_cost 
    });
    addNotification('Vampire turned! Assign to Ritual Chamber.', 'info');
    pulse('VAMPIRE TURNED');
  };

  /* ── construction handlers ── */
  const handleBuildGraveyard = () => {
    const cost = BUILDING_STATS.graveyard.cost;
    if (resources.bone < cost) { addNotification(`Need: ${cost} bone`, 'warning'); return; }
    removeResource('bone', cost);
    addBuilding({ id: uuidv4(), type: 'graveyard', level: 1, efficiency: 1.0, production_rate: BUILDING_STATS.graveyard.production_rate, maintenance_cost: BUILDING_STATS.graveyard.maintenance_cost, is_active: true, created_at: Date.now(), assigned_units: [] });
    addNotification('Graveyard built! Assign skeletons.', 'info');
    pulse('GRAVEYARD BUILT');
  };

  const handleBuildMorgue = () => {
    const cost = BUILDING_STATS.morgue.cost;
    if (resources.bone < cost) { addNotification(`Need: ${cost} bone`, 'warning'); return; }
    removeResource('bone', cost);
    addBuilding({ id: uuidv4(), type: 'morgue', level: 1, efficiency: 1.0, production_rate: BUILDING_STATS.morgue.production_rate, maintenance_cost: BUILDING_STATS.morgue.maintenance_cost, is_active: true, created_at: Date.now(), assigned_units: [] });
    addNotification('Morgue built! Assign skeletons.', 'info');
    pulse('MORGUE BUILT');
  };

  const handleBuildBoneMill = () => {
    const cost = BUILDING_STATS.bone_mill.cost;
    if (resources.bone < cost) { addNotification(`Need: ${cost} bone`, 'warning'); return; }
    removeResource('bone', cost);
    addBuilding({ id: uuidv4(), type: 'bone_mill', level: 1, efficiency: 1.0, production_rate: BUILDING_STATS.bone_mill.production_rate, maintenance_cost: BUILDING_STATS.bone_mill.maintenance_cost, is_active: true, created_at: Date.now(), assigned_units: [] });
    addNotification('Bone Mill built! Assign zombies.', 'info');
    pulse('BONE MILL BUILT');
  };

  const handleBuildNecroFactory = () => {
    const cost = BUILDING_STATS.necro_factory.cost;
    if (resources.bone < cost) { addNotification(`Need: ${cost} bone`, 'warning'); return; }
    removeResource('bone', cost);
    addBuilding({ id: uuidv4(), type: 'necro_factory', level: 1, efficiency: 1.0, production_rate: BUILDING_STATS.necro_factory.production_rate, maintenance_cost: BUILDING_STATS.necro_factory.maintenance_cost, is_active: true, created_at: Date.now(), assigned_units: [] });
    addNotification('Necro Factory built! Assign ghosts.', 'info');
    pulse('FACTORY BUILT');
  };

  const handleBuildRitualChamber = () => {
    const cost = BUILDING_STATS.ritual_chamber.cost;
    if (resources.bone < cost) { addNotification(`Need: ${cost} bone`, 'warning'); return; }
    removeResource('bone', cost);
    addBuilding({ id: uuidv4(), type: 'ritual_chamber', level: 1, efficiency: 1.0, production_rate: BUILDING_STATS.ritual_chamber.production_rate, maintenance_cost: BUILDING_STATS.ritual_chamber.maintenance_cost, is_active: true, created_at: Date.now(), assigned_units: [] });
    addNotification('Ritual Chamber built! Assign vampires.', 'info');
    pulse('CHAMBER BUILT');
  };

  const handleBuildDecayPit = () => {
    const cost = BUILDING_STATS.decay_pit.cost;
    if (resources.bone < cost) { addNotification(`Need: ${cost} bone`, 'warning'); return; }
    removeResource('bone', cost);
    addBuilding({ id: uuidv4(), type: 'decay_pit', level: 1, efficiency: 1.0, production_rate: BUILDING_STATS.decay_pit.production_rate, maintenance_cost: BUILDING_STATS.decay_pit.maintenance_cost, is_active: true, created_at: Date.now(), assigned_units: [] });
    addNotification('Decay Pit built! Assign ghouls.', 'info');
    pulse('DECAY PIT BUILT');
  };

  /* ── assignment ── */
  const handleAssignToBuildingType = (buildingType: string) => {
    const bStats = BUILDING_STATS[buildingType as keyof typeof BUILDING_STATS];
    const preferredUnitType = bStats?.preferred_unit;
    if (!preferredUnitType) return;

    const idleUnit = units.find(u => u.type === preferredUnitType && !u.assigned_to);
    if (!idleUnit) {
      addNotification(`No idle ${preferredUnitType}s available!`, 'warning');
      return;
    }

    const availableBuilding = buildings.find(b => 
      b.type === buildingType && 
      (b.assigned_units ?? []).length < getMaxUnitsPerBuilding(completedResearches)
    );

    if (!availableBuilding) {
      addNotification(`No available slots in ${buildingType.replace(/_/g, ' ')}!`, 'warning');
      return;
    }

    assignUnitToBuilding(idleUnit.id, availableBuilding.id);
    const label = preferredUnitType.charAt(0).toUpperCase() + preferredUnitType.slice(1);
    addNotification(`${label} assigned to ${buildingType.replace(/_/g, ' ')}`, 'info');
  };

  const handleUnassignFromBuildingType = (buildingType: string) => {
    const assignedUnit = units.find(u => {
      if (!u.assigned_to) return false;
      const b = buildings.find(bld => bld.id === u.assigned_to);
      return b?.type === buildingType;
    });

    if (!assignedUnit) return;
    unassignUnit(assignedUnit.id);
    addNotification('Unit unassigned.', 'info');
  };

  const handleUpgradeBuilding = (buildingId: string) => {
    const result = upgradeBuilding(buildingId);
    addNotification(result.message, result.success ? 'info' : 'warning');
    if (result.success) {
      pulse('BUILDING UPGRADED');
    }
  };

  /* ── Supabase operations ── */
  const handleCloudSave = async (showNotification = true) => {
    let activeSaveId = useGameStore.getState().save_id;
    if (!activeSaveId) {
      activeSaveId = uuidv4();
      useGameStore.getState().setSaveId(activeSaveId, '');
    }

    setSyncStatus('syncing');
    try {
      const gameState = useGameStore.getState().getSaveData();
      const { supabase } = await import('@/lib/supabase');
      
      const { data: existing, error: checkError } = await supabase
        .from('saves')
        .select('id')
        .eq('id', activeSaveId)
        .maybeSingle();

      if (checkError) throw checkError;

      let dbError;
      if (existing) {
        const { error } = await supabase
          .from('saves')
          .update({
            state: gameState,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeSaveId);
        dbError = error;
      } else {
        const { error } = await supabase
          .from('saves')
          .insert({
            id: activeSaveId,
            state: gameState,
            updated_at: new Date().toISOString()
          });
        dbError = error;
      }

      if (dbError) throw dbError;

      setSyncStatus('synced');
      setSyncError(null);
      if (showNotification) {
        addNotification('Save uploaded to Supabase!', 'info');
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncError(err.message || 'Sync failed');
      if (showNotification) {
        addNotification('Cloud save failed.', 'warning');
      }
    }
  };

  const handleCloudLoad = async (targetId: string) => {
    if (!targetId.trim()) {
      addNotification('Please enter a valid Save ID', 'warning');
      return;
    }
    setSyncStatus('syncing');
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('saves')
        .select('state')
        .eq('id', targetId.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        addNotification('Save ID not found!', 'warning');
        setSyncStatus('error');
        return;
      }

      const loadGame = useGameStore.getState().loadGame;
      loadGame(data.state);
      setSyncStatus('synced');
      setSyncError(null);
      addNotification('Save loaded from Supabase!', 'info');
      setCloudOpen(false);
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncError(err.message || 'Download failed');
      addNotification('Cloud load failed.', 'warning');
    }
  };

  const handleGenerateNewId = () => {
    const newId = uuidv4();
    useGameStore.getState().setSaveId(newId, '');
    addNotification('Generated new Save ID!', 'info');
  };

  /* ── dynamic costs ── */
  const skeletonCost = calculateUnitCost(UNIT_STATS.skeleton.base_cost, unitCurrentCounts.skeleton, UNIT_COST_SCALING, completedResearches, 'skeleton');
  const zombieCost = calculateUnitCost(UNIT_STATS.zombie.base_cost, unitCurrentCounts.zombie, UNIT_COST_SCALING, completedResearches, 'zombie');
  const ghoulCost = calculateUnitCost(UNIT_STATS.ghoul.base_cost, unitCurrentCounts.ghoul, UNIT_COST_SCALING, completedResearches, 'ghoul');
  const ghostCost = calculateUnitCost(UNIT_STATS.ghost.base_cost, unitCurrentCounts.ghost, UNIT_COST_SCALING, completedResearches, 'ghost');
  const vampireCost = calculateUnitCost(UNIT_STATS.vampire.base_cost, unitCurrentCounts.vampire, UNIT_COST_SCALING, completedResearches, 'vampire');

  const formatCost = (cost: Partial<Resources>) => {
    return Object.entries(cost).map(([res, amt]) => `${amt} ${res.replace(/_/g, ' ')}`).join(' + ');
  };

  const canAffordSkeleton = Object.entries(skeletonCost).every(([res, amt]) => resources[res as keyof Resources] >= (amt || 0));
  const canAffordZombie = Object.entries(zombieCost).every(([res, amt]) => resources[res as keyof Resources] >= (amt || 0));
  const canAffordGhoul = Object.entries(ghoulCost).every(([res, amt]) => resources[res as keyof Resources] >= (amt || 0));
  const canAffordGhost = Object.entries(ghostCost).every(([res, amt]) => resources[res as keyof Resources] >= (amt || 0));
  const canAffordVampire = Object.entries(vampireCost).every(([res, amt]) => resources[res as keyof Resources] >= (amt || 0));

  const UNIT_GROUPS: { type: UnitType; label: string }[] = [
    { type: 'skeleton', label: 'Skeletons' },
    { type: 'zombie',   label: 'Zombies' },
    { type: 'ghoul',    label: 'Ghouls' },
    { type: 'ghost',    label: 'Ghosts' },
    { type: 'vampire',  label: 'Vampires' },
  ];

  const groupedBuildings = Object.values(
    buildings.reduce((acc, b) => {
      const groupKey = `${b.type}:${b.level}`;
      if (!acc[groupKey]) {
        acc[groupKey] = { building: b, count: 0, assignedCount: 0 };
      }
      acc[groupKey].count += 1;
      acc[groupKey].assignedCount += units.filter((u) => u.assigned_to === b.id).length;
      return acc;
    }, {} as Record<string, { building: Building; count: number; assignedCount: number }>)
  );

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      {/* Atmosphere Gfx */}
      <div className="necro-bg-fog animate-fog-drift" aria-hidden="true" />
      <div className="necro-bg-vignette" aria-hidden="true" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 border-b border-slate-900/60 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CorpseIcon size={28} className="text-violet-500 animate-skull-pulse" />
            <div>
              <h1 className="font-display text-xl font-bold tracking-[0.2em] text-violet-400 leading-none">
                NECROCONOMICS
              </h1>
              <p className="font-display text-[9px] tracking-[0.4em] text-slate-500 uppercase mt-1">
                The Dead Economy
              </p>
            </div>
          </div>

          {/* Navigation & Cloud Save Controls */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 bg-slate-950/60 p-1 border border-slate-900 rounded-lg">
              <a href="/" className="px-3 py-1.5 rounded-md bg-violet-600/15 border border-violet-500/35 text-violet-200 text-xs font-semibold uppercase tracking-wider transition-all duration-300">
                Colony
              </a>
              <a href="/research" className="px-3 py-1.5 rounded-md border border-transparent text-slate-400 hover:text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all duration-300">
                Research
              </a>
            </nav>

            {/* Cloud Save dropdown toggle */}
            <div className="relative">
              <button 
                onClick={() => setCloudOpen(!cloudOpen)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-violet-500/20 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300"
              >
                <CloudIcon size={14} className="text-slate-300" />
                <span>Cloud Save</span>
                <span className={`w-2 h-2 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-500' :
                  syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
                  syncStatus === 'error' ? 'bg-rose-500' : 'bg-slate-600'
                }`} />
              </button>

              {/* Cloud Save Menu */}
              {cloudOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-950/95 border border-slate-850 p-4 rounded-xl shadow-2xl backdrop-blur-xl z-50 animate-fade-in-up">
                  <h3 className="font-display text-xs font-bold text-slate-300 tracking-wider uppercase mb-3 flex items-center justify-between">
                    <span>Database Backup</span>
                    <button onClick={() => setCloudOpen(false)} className="text-slate-500 hover:text-slate-300 text-sm">×</button>
                  </h3>
                  
                  {/* Save ID Display */}
                  <div className="mb-3.5">
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 block font-semibold mb-1">Your Save ID</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        readOnly 
                        value={saveId || 'No ID generated'} 
                        className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 px-2 py-1.5 rounded-lg flex-1 font-mono focus:outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (saveId) {
                            navigator.clipboard.writeText(saveId);
                            addNotification('Save ID copied to clipboard!', 'info');
                          }
                        }}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-violet-500/25 text-slate-400 hover:text-slate-200 text-xs cursor-pointer flex items-center justify-center"
                        title="Copy to clipboard"
                      >
                        <ClipboardIcon size={12} className="text-slate-400 hover:text-slate-200" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-3.5">
                    <button 
                      onClick={() => handleCloudSave(true)}
                      className="py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                    >
                      Backup Colony State
                    </button>
                    <button 
                      onClick={handleGenerateNewId}
                      className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                    >
                      New Save ID
                    </button>
                  </div>

                  <div className="h-[1px] bg-slate-900 mb-3.5" />

                  {/* Load Save ID */}
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 block font-semibold mb-1">Load Cloud Colony</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        placeholder="Paste Save ID..."
                        value={loadInputId}
                        onChange={(e) => setLoadInputId(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 px-2.5 py-1.5 rounded-lg flex-1 font-mono focus:outline-none"
                      />
                      <button 
                        onClick={() => handleCloudLoad(loadInputId)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 text-xs font-bold cursor-pointer"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                  
                  {syncError && (
                    <div className="mt-2 text-[9px] text-rose-500 bg-rose-950/20 border border-rose-900/30 p-1.5 rounded-md font-mono">
                      Error: {syncError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Resource Strip */}
      <section className="bg-slate-950/60 border-b border-slate-900 py-2.5 px-4 sticky top-[57px] z-30 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto flex flex-wrap gap-2.5 justify-center">
          {(Object.entries(resources) as [keyof Resources, number][]).map(([resource, amount]) => {
            const rate = useGameStore.getState().resourceRates[resource] || 0;
            const isDanger = dangerResources.has(resource);
            return (
              <div key={resource} className={`flex-1 min-w-[120px] max-w-[180px] transition-all duration-300 ${isDanger ? 'animate-pulse ring-2 ring-rose-500/60 rounded-xl' : ''}`}>
                <ResourceCard resource={resource} amount={Math.max(0, amount)} rate={rate} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Body Layout */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-[1400px] w-full mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: UNDEAD ARMY (Army) */}
          <section className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-4.5 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <h2 className="font-display text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                <CorpseIcon size={16} className="text-violet-400" />
                <span>Undead Army</span>
              </h2>
              <span className="text-[10px] font-mono bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-violet-400 font-bold">
                TYPES: {new Set(units.map(u => u.type)).size}
              </span>
            </div>

            {units.length === 0 ? (
              <div className="text-center py-10 px-4 flex flex-col items-center gap-2.5">
                <MorgueIcon size={26} className="text-slate-500 opacity-40" />
                <p className="font-display text-sm text-slate-400 tracking-wider">Army empty</p>
                <p className="text-xs text-slate-500 italic max-w-[200px]">
                  Harvest corpses and raise skeletons to construct workers.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {UNIT_GROUPS.map(({ type, label }) => {
                  const group = units.filter((u) => u.type === type);
                  if (group.length === 0) return null;
                  return (
                    <div key={type} className="bg-slate-950/20 border border-slate-900/50 rounded-xl overflow-hidden shadow-sm">
                      <UnitCard
                        unit={group[0]}
                        count={group.length}
                        completedResearches={completedResearches}
                      />
                      <div className="flex justify-between items-center px-3 py-2 bg-slate-950/40 border-t border-slate-900/40 text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">
                          Assigned: {group.filter(u => u.assigned_to).length}
                        </span>
                        <span className="text-amber-400 font-bold">
                          Idle: {group.filter(u => !u.assigned_to).length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* COLUMN 2: INDUSTRIAL SECTOR (Industrial) */}
          <section className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-4.5 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <h2 className="font-display text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                <FactoryIcon size={16} className="text-violet-400" />
                <span>Infrastructure</span>
              </h2>
              <span className="text-[10px] font-mono bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-violet-400 font-bold">
                COMPLEXES: {buildings.length}
              </span>
            </div>

            {groupedBuildings.length === 0 ? (
              <div className="text-center py-10 px-4 flex flex-col items-center gap-2.5">
                <StructuresIcon size={26} className="text-slate-500 opacity-40" />
                <p className="font-display text-sm text-slate-400 tracking-wider">No structures</p>
                <p className="text-xs text-slate-500 italic max-w-[200px]">
                  Build Morgues or Graveyards to generate resources automatically.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {groupedBuildings.map(({ building, count, assignedCount }) => (
                  <BuildingCard
                    key={`${building.type}-${building.level}`}
                    building={building}
                    assignedCount={assignedCount}
                    count={count}
                    completedResearches={completedResearches}
                    resources={resources}
                    onAssign={handleAssignToBuildingType}
                    onUnassign={handleUnassignFromBuildingType}
                    onUpgrade={handleUpgradeBuilding}
                  />
                ))}
              </div>
            )}
          </section>

          {/* COLUMN 3: DARK CORE (Core Actions) */}
          <section className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-4.5 backdrop-blur-md flex flex-col gap-5">
            <div className="border-b border-slate-900/60 pb-3">
              <h2 className="font-display text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                <StructuresIcon size={16} className="text-violet-400" />
                <span>Rituals & Construction</span>
              </h2>
            </div>

            {/* Harvesting & Butchery */}
            <div className="flex flex-col gap-2.5">
              <h3 className="font-display text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                Alchemical Harvesting
              </h3>
              <button 
                onClick={handleHarvestCorpse}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/20 border border-red-500/20 hover:border-red-500/50 rounded-xl cursor-pointer active:scale-98 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <CorpseIcon size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-start">
                    <span className="font-display text-[11px] font-bold tracking-wider text-slate-200 uppercase">Harvest Corpse</span>
                    <span className="text-[9px] font-mono text-slate-500">Search local battlefields</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-red-950/20 border border-red-900/25 px-2 py-0.5 rounded text-red-400 font-bold uppercase">
                  FREE
                </span>
              </button>

              <button 
                onClick={handleButcherCorpse}
                disabled={resources.corpse < 5}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/20 border border-slate-800 hover:border-slate-600 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-98 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <GraveyardIcon size={20} className="text-slate-400 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-start">
                    <span className="font-display text-[11px] font-bold tracking-wider text-slate-200 uppercase">Butcher Corpses</span>
                    <span className="text-[9px] font-mono text-slate-500">Extract bone and flesh matter</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400 max-w-[125px] text-right leading-tight font-semibold">
                  5 corpses → 8 bones + 4 flesh
                </span>
              </button>
            </div>

            {/* Raise Undead */}
            <div className="flex flex-col gap-2.5">
              <h3 className="font-display text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                Undead Incantations
              </h3>
              
              <button 
                onClick={handleRaiseSkeleton}
                disabled={!canAffordSkeleton}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/20 border border-blue-500/20 hover:border-blue-500/50 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-98 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <SkeletonIcon size={20} className="text-yellow-100 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-start">
                    <span className="font-display text-[11px] font-bold tracking-wider text-slate-200 uppercase">
                      Raise Skeleton ({unitCurrentCounts.skeleton})
                    </span>
                    <span className="text-[9px] text-slate-500">Decay: slow · Low cost worker</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 max-w-[140px] text-right leading-tight font-bold">
                  {formatCost(skeletonCost)}
                </span>
              </button>

              <button 
                onClick={handleRaiseZombie}
                disabled={!canRaiseZombie || !canAffordZombie}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/20 border border-blue-500/20 hover:border-blue-500/50 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-98 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <ZombieIcon size={20} className="text-green-500 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-start">
                    <span className="font-display text-[11px] font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                      <span>Raise Zombie ({unitCurrentCounts.zombie})</span>
                      {!canRaiseZombie && (
                        <span className="text-[9px] text-amber-500 flex items-center gap-0.5">
                          <LockIcon size={10} className="text-amber-500" />
                          <span>{stats.total_corpses_processed}/{GAME_CONFIG.UNLOCK_ZOMBIE}</span>
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] text-slate-500">Decay: high · Strong worker</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 max-w-[140px] text-right leading-tight font-bold">
                  {formatCost(zombieCost)}
                </span>
              </button>

              <button
                onClick={handleRaiseGhoul}
                disabled={!canAffordGhoul}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/20 border border-orange-500/20 hover:border-orange-500/50 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-98 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <GhoulIcon size={20} className="text-orange-500 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-start">
                    <span className="font-display text-[11px] font-bold tracking-wider text-slate-200 uppercase">
                      Raise Ghoul ({unitCurrentCounts.ghoul})
                    </span>
                    <span className="text-[9px] text-slate-500">Decay: medium · Biomatter worker</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 max-w-[140px] text-right leading-tight font-bold">
                  {formatCost(ghoulCost)}
                </span>
              </button>

              <button 
                onClick={handleRaiseGhost}
                disabled={!canRaiseGhost || !canAffordGhost}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/20 border border-violet-500/20 hover:border-violet-500/50 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-98 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <GhostIcon size={20} className="text-violet-400 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-start">
                    <span className="font-display text-[11px] font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                      <span>Summon Ghost ({unitCurrentCounts.ghost})</span>
                      {!canRaiseGhost && (
                        <span className="text-[9px] text-amber-500 flex items-center gap-0.5">
                          <LockIcon size={10} className="text-amber-500" />
                          <span>{stats.total_buildings_built}/{GAME_CONFIG.UNLOCK_GHOST}</span>
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] text-slate-500">Decay: very low · Efficient worker</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 max-w-[140px] text-right leading-tight font-bold">
                  {formatCost(ghostCost)}
                </span>
              </button>

              <button 
                onClick={handleRaiseVampire}
                disabled={!canRaiseVampire || !canAffordVampire}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/20 border border-rose-500/20 hover:border-rose-500/50 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-98 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <VampireIcon size={20} className="text-rose-500 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-start">
                    <span className="font-display text-[11px] font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                      <span>Turn Vampire ({unitCurrentCounts.vampire})</span>
                      {!canRaiseVampire && (
                        <span className="text-[9px] text-amber-500 flex items-center gap-0.5">
                          <LockIcon size={10} className="text-amber-500" />
                          <span>{stats.total_buildings_built}/{GAME_CONFIG.UNLOCK_VAMPIRE}</span>
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] text-slate-500">Decay: IMMORTAL · Master worker</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300 max-w-[140px] text-right leading-tight font-bold">
                  {formatCost(vampireCost)}
                </span>
              </button>
            </div>

            {/* Construct Facilities */}
            <div className="flex flex-col gap-2.5">
              <h3 className="font-display text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                Construct Industrial Facilities
              </h3>

              <div className="grid grid-cols-2 gap-2.5 text-[10px] font-mono">
                
                <button 
                  onClick={handleBuildGraveyard}
                  disabled={resources.bone < BUILDING_STATS.graveyard.cost}
                  className="p-3 bg-slate-950/65 hover:bg-slate-900/30 border border-slate-850 hover:border-emerald-500/25 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-97 text-left transition-all duration-300"
                >
                  <GraveyardIcon size={22} className="text-yellow-200 mb-1" />
                  <span className="font-display font-bold tracking-wide uppercase text-slate-300 text-[10px] block mb-0.5">Graveyard</span>
                  <span className="text-slate-500 block mb-2 font-body italic">+1.0 corpse/s</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-bold border border-slate-800">
                    {BUILDING_STATS.graveyard.cost} bone
                  </span>
                </button>

                <button 
                  onClick={handleBuildMorgue}
                  disabled={resources.bone < BUILDING_STATS.morgue.cost}
                  className="p-3 bg-slate-950/65 hover:bg-slate-900/30 border border-slate-850 hover:border-emerald-500/25 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-97 text-left transition-all duration-300"
                >
                  <MorgueIcon size={22} className="text-amber-200 mb-1" />
                  <span className="font-display font-bold tracking-wide uppercase text-slate-300 text-[10px] block mb-0.5">Morgue</span>
                  <span className="text-slate-500 block mb-2 font-body italic">+1.5 bone/s</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-bold border border-slate-800">
                    {BUILDING_STATS.morgue.cost} bone
                  </span>
                </button>

                <button 
                  onClick={handleBuildBoneMill}
                  disabled={resources.bone < BUILDING_STATS.bone_mill.cost}
                  className="p-3 bg-slate-950/65 hover:bg-slate-900/30 border border-slate-850 hover:border-emerald-500/25 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-97 text-left transition-all duration-300"
                >
                  <BoneMillIcon size={22} className="text-orange-400 mb-1" />
                  <span className="font-display font-bold tracking-wide uppercase text-slate-300 text-[10px] block mb-0.5">Bone Mill</span>
                  <span className="text-slate-500 block mb-2 font-body italic">5 bone → 2 flesh/s</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-bold border border-slate-800">
                    {BUILDING_STATS.bone_mill.cost} bone
                  </span>
                </button>

                <button 
                  onClick={handleBuildNecroFactory}
                  disabled={resources.bone < BUILDING_STATS.necro_factory.cost}
                  className="p-3 bg-slate-950/65 hover:bg-slate-900/30 border border-slate-850 hover:border-emerald-500/25 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-97 text-left transition-all duration-300"
                >
                  <FactoryIcon size={22} className="text-violet-400 mb-1" />
                  <span className="font-display font-bold tracking-wide uppercase text-slate-300 text-[10px] block mb-0.5">Factory</span>
                  <span className="text-slate-500 block mb-2 font-body italic">+0.2 soul/s</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-bold border border-slate-800">
                    {BUILDING_STATS.necro_factory.cost} bone
                  </span>
                </button>

                <button 
                  onClick={handleBuildRitualChamber}
                  disabled={resources.bone < BUILDING_STATS.ritual_chamber.cost}
                  className="p-3 bg-slate-950/65 hover:bg-slate-900/30 border border-slate-850 hover:border-emerald-500/25 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-97 text-left transition-all duration-300"
                >
                  <RitualChamberIcon size={22} className="text-rose-500 mb-1" />
                  <span className="font-display font-bold tracking-wide uppercase text-slate-300 text-[10px] block mb-0.5">Ritual</span>
                  <span className="text-slate-500 block mb-2 font-body italic">+0.1 ritual/s</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-bold border border-slate-800">
                    {BUILDING_STATS.ritual_chamber.cost} bone
                  </span>
                </button>

                <button 
                  onClick={handleBuildDecayPit}
                  disabled={resources.bone < BUILDING_STATS.decay_pit.cost}
                  className="p-3 bg-slate-950/65 hover:bg-slate-900/30 border border-slate-850 hover:border-emerald-500/25 rounded-xl disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer active:scale-97 text-left transition-all duration-300"
                >
                  <DecayPitIcon size={22} className="text-emerald-500 mb-1" />
                  <span className="font-display font-bold tracking-wide uppercase text-slate-300 text-[10px] block mb-0.5">Decay Pit</span>
                  <span className="text-slate-500 block mb-2 font-body italic">+0.15 fuel/s</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-bold border border-slate-800">
                    {BUILDING_STATS.decay_pit.cost} bone
                  </span>
                </button>

              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Drawer stats panel */}
      <footer className="z-45 sticky bottom-0 bg-slate-950/90 border-t border-slate-900/60 backdrop-blur-md">
        <button 
          onClick={() => setStatsOpen(!statsOpen)}
          className="w-full text-center py-2.5 text-[10px] uppercase font-mono tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <InfoIcon size={14} className="text-slate-500" />
          <span>Colony System Metrics</span>
          <span>{statsOpen ? <ArrowDownIcon size={12} className="inline text-slate-500" /> : <ArrowUpIcon size={12} className="inline text-slate-500" />}</span>
        </button>

        {statsOpen && (
          <div className="max-w-[1400px] mx-auto px-6 py-4 animate-fade-in-up">
            <StatsPanel stats={stats} tick={tick} buildings={buildings} units={units} />
          </div>
        )}
      </footer>
    </div>
  );
}
