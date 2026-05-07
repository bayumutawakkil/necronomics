'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StatsPanel } from '@/components/ui/StatsPanel';
import { ResourceCard } from '@/components/ui/ResourceCard';
import { UnitCard } from '@/components/ui/UnitCard';
import { BuildingCard } from '@/components/ui/BuildingCard';
import { useGameStore } from '@/stores/useGameStore';
import { useUIStore } from '@/stores/useUIStore';
import { useGameLoop } from '@/lib/hooks/useGameLoop';
import { UNIT_STATS, BUILDING_STATS, GAME_CONFIG, UNIT_ICONS, BUILDING_ICONS } from '@/lib/game/constants';
import { Resources, Unit, Building, UnitType } from '@/types/game';
import './page.css';

export default function GamePage() {
  const { tick } = useGameLoop();
  const stats     = useGameStore((s) => s.stats);
  const units     = useGameStore((s) => s.units);
  const buildings = useGameStore((s) => s.buildings);
  const resources = useGameStore((s) => s.resources);
  const addResource         = useGameStore((s) => s.addResource);
  const removeResource      = useGameStore((s) => s.removeResource);
  const addUnit             = useGameStore((s) => s.addUnit);
  const addBuilding         = useGameStore((s) => s.addBuilding);
  const assignUnitToBuilding = useGameStore((s) => s.assignUnitToBuilding);
  const unassignUnit        = useGameStore((s) => s.unassignUnit);
  const addNotification     = useUIStore((s) => s.addNotification);

  const [lastAction,    setLastAction]    = useState<string | null>(null);
  const [assigningUnit, setAssigningUnit] = useState<Unit | null>(null);
  const [unitsOpen,     setUnitsOpen]     = useState(true);
  const [facilitiesOpen,setFacilitiesOpen]= useState(true);

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
        addNotification(`⚠️ ${key.replace(/_/g, ' ')} depleted!`, 'warning');
      }
    });
    if (newDanger.size > 0) {
      setDangerResources(newDanger);
      setTimeout(() => setDangerResources(new Set()), 1400);
    }
    prevResourcesRef.current = resources;
  }, [resources]);

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
    addNotification('🪦 5 corpses → 8 bone + 4 flesh', 'info');
    pulse('BUTCHERED');
  };

  const handleRaiseSkeleton = () => {
    if (resources.corpse < 1 || resources.bone < 5) {
      addNotification('Need: 1 corpse + 5 bone', 'warning'); return;
    }
    removeResource('corpse', 1); removeResource('bone', 5);
    useGameStore.setState((s) => ({
      stats: { ...s.stats, total_corpses_processed: s.stats.total_corpses_processed + 1 },
      totalCorpsesProcessed: s.totalCorpsesProcessed + 1,
    }));
    const sk = UNIT_STATS.skeleton;
    addUnit({ id: uuidv4(), type: 'skeleton', freshness: 100, efficiency: sk.efficiency, decay_rate: sk.decay_rate, insanity_risk: sk.insanity_risk, created_at: Date.now(), maintenance_cost: sk.maintenance_cost });
    addNotification('🦴 Skeleton raised! Assign to Morgue.', 'info');
    pulse('SKELETON RAISED');
  };

  const handleRaiseZombie = () => {
    if (!canRaiseZombie) { addNotification(`Unlock at ${GAME_CONFIG.UNLOCK_ZOMBIE} corpses (${stats.total_corpses_processed}/${GAME_CONFIG.UNLOCK_ZOMBIE})`, 'warning'); return; }
    if (resources.corpse < 2 || resources.bone < 3 || resources.flesh < 5) { addNotification('Need: 2 corpse + 3 bone + 5 flesh', 'warning'); return; }
    removeResource('corpse', 2); removeResource('bone', 3); removeResource('flesh', 5);
    useGameStore.setState((s) => ({
      stats: { ...s.stats, total_corpses_processed: s.stats.total_corpses_processed + 2 },
      totalCorpsesProcessed: s.totalCorpsesProcessed + 2,
    }));
    const zs = UNIT_STATS.zombie;
    addUnit({ id: uuidv4(), type: 'zombie', freshness: 100, efficiency: zs.efficiency, decay_rate: zs.decay_rate, insanity_risk: zs.insanity_risk, created_at: Date.now(), maintenance_cost: zs.maintenance_cost });
    addNotification('🧟 Zombie raised! Assign to Bone Mill.', 'info');
    pulse('ZOMBIE RAISED');
  };

  const handleRaiseGhost = () => {
    if (!canRaiseGhost) { addNotification(`Unlock at ${GAME_CONFIG.UNLOCK_GHOST} buildings (${stats.total_buildings_built}/${GAME_CONFIG.UNLOCK_GHOST})`, 'warning'); return; }
    if (resources.soul_residue < 10 || resources.bone < 5) { addNotification('Need: 10 soul residue + 5 bone', 'warning'); return; }
    removeResource('soul_residue', 10); removeResource('bone', 5);
    const gs = UNIT_STATS.ghost;
    addUnit({ id: uuidv4(), type: 'ghost', freshness: 100, efficiency: gs.efficiency, decay_rate: gs.decay_rate, insanity_risk: gs.insanity_risk, created_at: Date.now(), maintenance_cost: gs.maintenance_cost });
    addNotification('👻 Ghost summoned! Assign to Necro Factory.', 'info');
    pulse('GHOST SUMMONED');
  };

  const handleRaiseVampire = () => {
    if (!canRaiseVampire) { addNotification(`Unlock at ${GAME_CONFIG.UNLOCK_VAMPIRE} buildings (${stats.total_buildings_built}/${GAME_CONFIG.UNLOCK_VAMPIRE})`, 'warning'); return; }
    if (resources.ritual_energy < 20 || resources.soul_residue < 5 || resources.bone < 10) { addNotification('Need: 20 ritual energy + 5 soul residue + 10 bone', 'warning'); return; }
    removeResource('ritual_energy', 20); removeResource('soul_residue', 5); removeResource('bone', 10);
    const vs = UNIT_STATS.vampire;
    addUnit({ id: uuidv4(), type: 'vampire', freshness: 100, efficiency: vs.efficiency, decay_rate: vs.decay_rate, insanity_risk: vs.insanity_risk, created_at: Date.now(), maintenance_cost: vs.maintenance_cost });
    addNotification('🧛 Vampire turned! Assign to Ritual Chamber.', 'info');
    pulse('VAMPIRE TURNED');
  };

  const handleBuildMorgue = () => {
    const cost = BUILDING_STATS.morgue.cost;
    if (resources.bone < cost) { addNotification(`Need: ${cost} bone`, 'warning'); return; }
    removeResource('bone', cost);
    addBuilding({ id: uuidv4(), type: 'morgue', level: 1, efficiency: 1.0, production_rate: BUILDING_STATS.morgue.production_rate, maintenance_cost: BUILDING_STATS.morgue.maintenance_cost, is_active: true, created_at: Date.now(), assigned_units: [] });
    addNotification('⚰️ Morgue built! Assign skeletons.', 'info');
    pulse('MORGUE BUILT');
  };

  const handleBuildBoneMill = () => {
    const cost = BUILDING_STATS.bone_mill.cost;
    if (resources.bone < cost) { addNotification(`Need: ${cost} bone`, 'warning'); return; }
    removeResource('bone', cost);
    addBuilding({ id: uuidv4(), type: 'bone_mill', level: 1, efficiency: 1.0, production_rate: BUILDING_STATS.bone_mill.production_rate, maintenance_cost: BUILDING_STATS.bone_mill.maintenance_cost, is_active: true, created_at: Date.now(), assigned_units: [] });
    addNotification('⚙️ Bone Mill built! 5 bone/s → 2 flesh/s. Assign zombies.', 'info');
    pulse('BONE MILL BUILT');
  };

  /* ── assignment ── */
  const handleAssignUnit = (unit: Unit, buildingId: string) => {
    const b = buildings.find((x) => x.id === buildingId);
    if (!b) return;
    if ((b.assigned_units ?? []).length >= GAME_CONFIG.MAX_UNITS_PER_BUILDING) {
      addNotification('Building full (5 max)!', 'warning'); return;
    }
    if (unit.assigned_to) unassignUnit(unit.id);
    assignUnitToBuilding(unit.id, buildingId);
    addNotification(`${UNIT_ICONS[unit.type]} assigned to ${b.type.replace(/_/g, ' ')}`, 'info');
    setAssigningUnit(null);
  };

  const handleUnassignUnit = (unitId: string) => {
    unassignUnit(unitId);
    addNotification('Unit unassigned.', 'info');
  };

  const getAssignedBuilding = (unit: Unit): Building | undefined =>
    unit.assigned_to ? buildings.find((b) => b.id === unit.assigned_to) : undefined;

  /* ── unit sub-groups ── */
  const UNIT_GROUPS: { type: UnitType; label: string; icon: string }[] = [
    { type: 'skeleton', label: 'Skeletons', icon: '🦴' },
    { type: 'zombie',   label: 'Zombies',   icon: '🧟' },
    { type: 'ghoul',    label: 'Ghouls',    icon: '👹' },
    { type: 'ghost',    label: 'Ghosts',    icon: '👻' },
    { type: 'vampire',  label: 'Vampires',  icon: '🧛' },
  ];

  /* ── render ── */
  return (
    <div className="necro-root">
      <div className="necro-bg-fog" aria-hidden="true" />
      <div className="necro-bg-vignette" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="necro-header">
        <div className="necro-header-inner">
          <div className="necro-logo">
            <span className="necro-logo-skull">☠</span>
            <div>
              <h1 className="necro-title">NECROCONOMICS</h1>
              <p className="necro-subtitle">The Dead Economy</p>
            </div>
          </div>
          <StatsPanel stats={stats} tick={tick} />
          <div className="necro-ticker">
            <span className="necro-ticker-dot" />
            <span className="necro-ticker-text">
              {lastAction ?? `TICK ${tick} — COLONY OPERATIONAL`}
            </span>
          </div>
        </div>
      </header>

      <main className="necro-main">

        {/* Resources bar */}
        <section className="necro-resources-section">
          <div className="necro-resources-grid">
            {(Object.entries(resources) as [keyof Resources, number][]).map(([resource, amount]) => {
              const rate = useGameStore.getState().resourceRates[resource] || 0;
              const isDanger = dangerResources.has(resource);
              return (
                <div key={resource} className={isDanger ? 'necro-res-danger' : ''} style={{ borderRadius: 'var(--radius)' }}>
                  <ResourceCard resource={resource} amount={Math.max(0, amount)} rate={rate} />
                </div>
              );
            })}
          </div>
        </section>

        {/* 3-column body */}
        <div className="necro-body-grid">

          {/* Units + Facilities stacked in left area */}
          <div className="necro-content-col">

            {/* Units panel */}
            <section className="necro-panel">
              <button
                className="necro-panel-header"
                onClick={() => setUnitsOpen((v) => !v)}
                aria-expanded={unitsOpen}
              >
                <div className="necro-panel-title">
                  <span>💀</span>
                  <span>Active Units</span>
                  <span className="necro-badge">{units.length}</span>
                </div>
                <span style={{ color: 'var(--col-muted)', fontSize: 9 }}>{unitsOpen ? '▲' : '▼'}</span>
                <div className="necro-panel-glow" />
              </button>

              {unitsOpen && (
                <div className="necro-panel-body">
                  {units.length === 0 ? (
                    <div className="necro-empty">
                      <div className="necro-empty-icon">⚰️</div>
                      <p className="necro-empty-title">No undead yet…</p>
                      <p className="necro-empty-hint">Harvest corpses and raise skeletons to build your army.</p>
                    </div>
                  ) : (
                    <>
                      {UNIT_GROUPS.map(({ type, label, icon }) => {
                        const group = units.filter((u) => u.type === type);
                        if (group.length === 0) return null;
                        return (
                          <div key={type} className="necro-unit-group">
                            <div className="necro-unit-group-label">
                              <span>{icon}</span>
                              <span>{label}</span>
                              <span className="necro-unit-group-count">{group.length}</span>
                            </div>
                            <div className="necro-unit-list">
                              {group.map((unit) => {
                                const ab = getAssignedBuilding(unit);
                                return (
                                  <div key={unit.id} className="necro-unit-item">
                                    <UnitCard unit={unit} />
                                    <div className="necro-assign-bar">
                                      {ab ? (
                                        <>
                                          <span className="necro-assign-tag">
                                            {BUILDING_ICONS[ab.type]} {ab.type.replace(/_/g, ' ')}
                                          </span>
                                          <button
                                            className="necro-assign-btn necro-assign-btn--remove"
                                            onClick={() => handleUnassignUnit(unit.id)}
                                          >✕ Unassign</button>
                                        </>
                                      ) : (
                                        <>
                                          <span className="necro-assign-idle">idle</span>
                                          {buildings.length > 0 ? (
                                            assigningUnit?.id === unit.id ? (
                                              <div className="necro-assign-picker">
                                                {buildings.map((b) => (
                                                  <button
                                                    key={b.id}
                                                    className="necro-assign-pick-btn"
                                                    onClick={() => handleAssignUnit(unit, b.id)}
                                                  >
                                                    {BUILDING_ICONS[b.type]} {b.type.replace(/_/g, ' ')}
                                                    <span className="necro-assign-slots">
                                                      {(b.assigned_units ?? []).length}/{GAME_CONFIG.MAX_UNITS_PER_BUILDING}
                                                    </span>
                                                  </button>
                                                ))}
                                                <button
                                                  className="necro-assign-btn necro-assign-btn--cancel"
                                                  onClick={() => setAssigningUnit(null)}
                                                >Cancel</button>
                                              </div>
                                            ) : (
                                              <button
                                                className="necro-assign-btn necro-assign-btn--assign"
                                                onClick={() => setAssigningUnit(unit)}
                                              >+ Assign</button>
                                            )
                                          ) : (
                                            <span className="necro-assign-hint">build a facility first</span>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </section>

            {/* Facilities panel */}
            <section className="necro-panel">
              <button
                className="necro-panel-header"
                onClick={() => setFacilitiesOpen((v) => !v)}
                aria-expanded={facilitiesOpen}
              >
                <div className="necro-panel-title">
                  <span>🏭</span>
                  <span>Facilities</span>
                  <span className="necro-badge">{buildings.length}</span>
                </div>
                <span style={{ color: 'var(--col-muted)', fontSize: 9 }}>{facilitiesOpen ? '▲' : '▼'}</span>
                <div className="necro-panel-glow" />
              </button>

              {facilitiesOpen && (
                <div className="necro-panel-body">
                  {buildings.length === 0 ? (
                    <div className="necro-empty">
                      <div className="necro-empty-icon">🏚️</div>
                      <p className="necro-empty-title">No structures yet…</p>
                      <p className="necro-empty-hint">Build a Morgue to generate resources automatically.</p>
                    </div>
                  ) : (
                    <div className="necro-unit-list">
                      {buildings.map((b) => (
                        <BuildingCard
                          key={b.id}
                          building={b}
                          assignedCount={units.filter((u) => u.assigned_to === b.id).length}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

          </div>{/* /content-col */}

          {/* Sidebar */}
          <aside className="necro-sidebar">

            {/* Actions */}
            <section className="necro-panel necro-panel--actions">
              <div className="necro-panel-header">
                <div className="necro-panel-title"><span>⚙️</span><span>Quick Actions</span></div>
                <div className="necro-panel-glow necro-panel-glow--amber" />
              </div>
              <div className="necro-panel-body">
                <div className="necro-actions-list">

                  <button className="necro-action necro-action--danger" onClick={handleHarvestCorpse}>
                    <span className="necro-action-icon">💀</span>
                    <span className="necro-action-info">
                      <span className="necro-action-label">Harvest Corpse</span>
                      <span className="necro-action-cost">FREE</span>
                    </span>
                    <span className="necro-action-arrow">→</span>
                  </button>

                  <button className={`necro-action necro-action--secondary${resources.corpse < 5 ? ' necro-action--disabled' : ''}`} onClick={handleButcherCorpse} disabled={resources.corpse < 5}>
                    <span className="necro-action-icon">🪦</span>
                    <span className="necro-action-info">
                      <span className="necro-action-label">Butcher Corpses</span>
                      <span className="necro-action-cost">5 corpse → 8 bone + 4 flesh</span>
                    </span>
                    <span className="necro-action-arrow">→</span>
                  </button>

                  <button className={`necro-action necro-action--primary${(resources.corpse < 1 || resources.bone < 5) ? ' necro-action--disabled' : ''}`} onClick={handleRaiseSkeleton} disabled={resources.corpse < 1 || resources.bone < 5}>
                    <span className="necro-action-icon">🦴</span>
                    <span className="necro-action-info">
                      <span className="necro-action-label">Raise Skeleton</span>
                      <span className="necro-action-cost">1 corpse + 5 bone · Morgue</span>
                    </span>
                    <span className="necro-action-arrow">→</span>
                  </button>

                  <button className={`necro-action necro-action--primary${(!canRaiseZombie || resources.corpse < 2 || resources.bone < 3 || resources.flesh < 5) ? ' necro-action--disabled' : ''}`} onClick={handleRaiseZombie} disabled={!canRaiseZombie || resources.corpse < 2 || resources.bone < 3 || resources.flesh < 5}>
                    <span className="necro-action-icon">🧟</span>
                    <span className="necro-action-info">
                      <span className="necro-action-label">
                        Raise Zombie
                        {!canRaiseZombie && <span className="necro-action-lock">🔒 {stats.total_corpses_processed}/{GAME_CONFIG.UNLOCK_ZOMBIE}</span>}
                      </span>
                      <span className="necro-action-cost">2 corpse + 3 bone + 5 flesh · Bone Mill</span>
                    </span>
                    <span className="necro-action-arrow">→</span>
                  </button>

                  <button className={`necro-action necro-action--ghost${(!canRaiseGhost || resources.soul_residue < 10 || resources.bone < 5) ? ' necro-action--disabled' : ''}`} onClick={handleRaiseGhost} disabled={!canRaiseGhost || resources.soul_residue < 10 || resources.bone < 5}>
                    <span className="necro-action-icon">👻</span>
                    <span className="necro-action-info">
                      <span className="necro-action-label">
                        Summon Ghost
                        {!canRaiseGhost && <span className="necro-action-lock">🔒 {stats.total_buildings_built}/{GAME_CONFIG.UNLOCK_GHOST}</span>}
                      </span>
                      <span className="necro-action-cost">10 soul residue + 5 bone · Necro Factory</span>
                    </span>
                    <span className="necro-action-arrow">→</span>
                  </button>

                  <button className={`necro-action necro-action--vampire${(!canRaiseVampire || resources.ritual_energy < 20 || resources.soul_residue < 5 || resources.bone < 10) ? ' necro-action--disabled' : ''}`} onClick={handleRaiseVampire} disabled={!canRaiseVampire || resources.ritual_energy < 20 || resources.soul_residue < 5 || resources.bone < 10}>
                    <span className="necro-action-icon">🧛</span>
                    <span className="necro-action-info">
                      <span className="necro-action-label">
                        Turn Vampire
                        {!canRaiseVampire && <span className="necro-action-lock">🔒 {stats.total_buildings_built}/{GAME_CONFIG.UNLOCK_VAMPIRE}</span>}
                      </span>
                      <span className="necro-action-cost">20 ritual energy + 5 soul residue + 10 bone</span>
                    </span>
                    <span className="necro-action-arrow">→</span>
                  </button>

                  <div className="necro-actions-divider" />

                  <button className={`necro-action necro-action--success${resources.bone < BUILDING_STATS.morgue.cost ? ' necro-action--disabled' : ''}`} onClick={handleBuildMorgue} disabled={resources.bone < BUILDING_STATS.morgue.cost}>
                    <span className="necro-action-icon">⚰️</span>
                    <span className="necro-action-info">
                      <span className="necro-action-label">Build Morgue</span>
                      <span className="necro-action-cost">{BUILDING_STATS.morgue.cost} bone · +0.5 bone/s</span>
                    </span>
                    <span className="necro-action-arrow">→</span>
                  </button>

                  <button className={`necro-action necro-action--success${resources.bone < BUILDING_STATS.bone_mill.cost ? ' necro-action--disabled' : ''}`} onClick={handleBuildBoneMill} disabled={resources.bone < BUILDING_STATS.bone_mill.cost}>
                    <span className="necro-action-icon">⚙️</span>
                    <span className="necro-action-info">
                      <span className="necro-action-label">Build Bone Mill</span>
                      <span className="necro-action-cost">{BUILDING_STATS.bone_mill.cost} bone · 5 bone/s → 2 flesh/s</span>
                    </span>
                    <span className="necro-action-arrow">→</span>
                  </button>

                </div>
              </div>
            </section>

            {/* Progression */}
            <section className="necro-panel">
              <div className="necro-panel-header">
                <div className="necro-panel-title"><span>🗺️</span><span>Progression</span></div>
                <div className="necro-panel-glow" />
              </div>
              <div className="necro-panel-body">
                <div className="necro-prog-list">
                  {([
                    { icon: '🧟', name: 'Zombie',  desc: `Process ${GAME_CONFIG.UNLOCK_ZOMBIE} corpses`,   done: canRaiseZombie,  cur: stats.total_corpses_processed, max: GAME_CONFIG.UNLOCK_ZOMBIE  },
                    { icon: '👻', name: 'Ghost',   desc: `Build ${GAME_CONFIG.UNLOCK_GHOST} structures`,   done: canRaiseGhost,   cur: stats.total_buildings_built,   max: GAME_CONFIG.UNLOCK_GHOST   },
                    { icon: '🧛', name: 'Vampire', desc: `Build ${GAME_CONFIG.UNLOCK_VAMPIRE} structures`, done: canRaiseVampire, cur: stats.total_buildings_built,   max: GAME_CONFIG.UNLOCK_VAMPIRE },
                  ] as const).map(({ icon, name, desc, done, cur, max }) => (
                    <div key={name} className={`necro-prog-row${done ? ' necro-prog-row--done' : ''}`}>
                      <span className="necro-prog-icon">{icon}</span>
                      <div className="necro-prog-info">
                        <span className="necro-prog-name">{name}</span>
                        <span className="necro-prog-desc">{desc}</span>
                        <div className="necro-prog-track">
                          <div className="necro-prog-fill" style={{ width: `${Math.min(100, (cur / max) * 100)}%` }} />
                        </div>
                      </div>
                      <span className="necro-prog-val">{done ? '✓' : `${Math.min(cur, max)}/${max}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Lore */}
            <section className="necro-panel necro-panel--about">
              <div className="necro-panel-header">
                <div className="necro-panel-title"><span>📜</span><span>Lore</span></div>
              </div>
              <div className="necro-panel-body">
                <p className="necro-lore-title">Necroconomics</p>
                <p className="necro-lore-body">
                  An absurdist idle game where death powers your economy. Build your undead workforce
                  and create production chains of the macabre.
                </p>
                <div className="necro-tip">
                  <span className="necro-tip-dot">💡</span>
                  <span>Assign skeletons to Morgues and zombies to Bone Mills to multiply output!</span>
                </div>
              </div>
            </section>

          </aside>
        </div>{/* /body-grid */}
      </main>
    </div>
  );
}
