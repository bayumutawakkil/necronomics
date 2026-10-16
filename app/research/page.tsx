'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ResourceCard } from '@/components/ui/ResourceCard';
import { useGameStore } from '@/stores/useGameStore';
import { useResearchStore } from '@/stores/useResearchStore';
import { useUIStore } from '@/stores/useUIStore';
import { useGameLoop } from '@/lib/hooks/useGameLoop';
import { RESEARCHES, RESEARCH_CATEGORIES } from '@/lib/game/researches';
import { Research, ResearchCategory } from '@/types/research';
import { Resources } from '@/types/game';
import { 
  CorpseIcon, BoneIcon, FleshIcon, LabIcon, StarIcon, CheckIcon, 
  LockIcon, CloudIcon, ClipboardIcon, StructuresIcon, WarningIcon, 
  ClockIcon, ResearchIcon 
} from '@/components/ui/Icons';

export default function ResearchPage() {
  useGameLoop();
  
  const resources = useGameStore((s) => s.resources);
  const stats = useGameStore((s) => s.stats);
  const saveId = useGameStore((s) => s.save_id);
  const removeResource = useGameStore((s) => s.removeResource);
  const hasResources = useGameStore((s) => s.hasResources);
  
  const completedResearches = useResearchStore((s) => s.completedResearches);
  const currentResearch = useResearchStore((s) => s.currentResearch);
  const startResearch = useResearchStore((s) => s.startResearch);
  const cancelResearch = useResearchStore((s) => s.cancelResearch);
  const getResearchStatus = useResearchStore((s) => s.getResearchStatus);
  
  const addNotification = useUIStore((s) => s.addNotification);
  
  const [selectedCategory, setSelectedCategory] = useState<ResearchCategory | 'all'>('all');
  const [cloudOpen, setCloudOpen] = useState(false);
  const [loadInputId, setLoadInputId] = useState('');

  // Supabase states
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Hook auto-sync with the game loop's 60-tick save frequency
  const lastSaved = useGameStore((s) => s.lastSaved);
  useEffect(() => {
    if (saveId && lastSaved > 0) {
      handleCloudSave(false); // Auto-sync silently
    }
  }, [lastSaved]);

  const handleStartResearch = (researchId: string) => {
    const research = RESEARCHES[researchId];
    if (!research) return;
    
    if (!hasResources(research.cost)) {
      addNotification('Not enough resources!', 'warning');
      return;
    }
    
    // Deduct cost
    Object.entries(research.cost).forEach(([res, amt]) => {
      if (amt) removeResource(res as keyof Resources, amt);
    });
    
    if (startResearch(researchId)) {
      addNotification(`Started researching: ${research.name}`, 'info');
    }
  };

  const handleCancelResearch = () => {
    cancelResearch();
    addNotification('Research cancelled', 'warning');
  };

  const filteredResearches = Object.values(RESEARCHES).filter(r => 
    selectedCategory === 'all' || r.category === selectedCategory
  );

  const researchesByStatus = {
    available: filteredResearches.filter(r => 
      getResearchStatus(r.id, stats.total_corpses_processed, stats.total_buildings_built) === 'available'
    ),
    locked: filteredResearches.filter(r => 
      getResearchStatus(r.id, stats.total_corpses_processed, stats.total_buildings_built) === 'locked'
    ),
    completed: filteredResearches.filter(r => 
      getResearchStatus(r.id, stats.total_corpses_processed, stats.total_buildings_built) === 'completed'
    ),
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
                Research Lab
              </p>
            </div>
          </div>

          {/* Navigation & Cloud Save Controls */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 bg-slate-950/60 p-1 border border-slate-900 rounded-lg">
              <a href="/" className="px-3 py-1.5 rounded-md border border-transparent text-slate-400 hover:text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all duration-300">
                Colony
              </a>
              <a href="/research" className="px-3 py-1.5 rounded-md bg-violet-600/15 border border-violet-500/35 text-violet-200 text-xs font-semibold uppercase tracking-wider transition-all duration-300">
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
            return (
              <div key={resource} className="flex-1 min-w-[120px] max-w-[180px]">
                <ResourceCard resource={resource} amount={Math.max(0, amount)} rate={rate} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-[1400px] w-full mx-auto z-10 flex flex-col gap-6">
        
        {/* Current Research Area */}
        {currentResearch && (
          <section className="bg-slate-900/10 border border-violet-500/20 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-4">
            <h2 className="font-display text-xs font-bold tracking-widest text-violet-400 uppercase flex items-center gap-2">
              <LabIcon size={16} className="text-violet-400" />
              <span>Ongoing Lab Experiment</span>
            </h2>
            
            {(() => {
              const research = RESEARCHES[currentResearch.researchId];
              return (
                <div className="flex flex-col md:flex-row items-center gap-5 p-4 bg-slate-950/60 border border-slate-900 rounded-xl">
                  <span className="filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                    <ResearchIcon name={research.icon} size={36} />
                  </span>
                  <div className="flex-1 w-full">
                    <h3 className="font-display text-base font-bold text-violet-300 uppercase tracking-widest">{research.name}</h3>
                    <p className="text-xs text-slate-400 italic mb-3">{research.description}</p>
                    
                    {/* Progress tracking */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                        style={{ width: `${Math.min(100, currentResearch.progress)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-1.5">{Math.floor(currentResearch.progress)}% Complete</p>
                  </div>
                  <button
                    onClick={handleCancelResearch}
                    className="w-full md:w-auto px-5 py-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 font-bold rounded-lg text-xs font-display uppercase tracking-widest cursor-pointer transition-all duration-300 active:scale-95"
                  >
                    Abort
                  </button>
                </div>
              );
            })()}
          </section>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-start items-center bg-slate-950/40 p-1.5 border border-slate-900 rounded-xl self-start">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-display text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-violet-600/15 border border-violet-500/35 text-violet-200 shadow-md'
                : 'border border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            All Fields
          </button>
          {Object.entries(RESEARCH_CATEGORIES).map(([key, { name, icon }]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as ResearchCategory)}
              className={`px-4 py-2 rounded-lg font-display text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === key
                  ? 'bg-violet-600/15 border border-violet-500/35 text-violet-200 shadow-md'
                  : 'border border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ResearchIcon name={icon} size={12} />
              <span>{name}</span>
            </button>
          ))}
        </div>

        {/* Available Field Cards */}
        {researchesByStatus.available.length > 0 && (
          <section className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-4.5 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <h2 className="font-display text-xs font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                <StarIcon size={16} className="text-violet-400" />
                <span>Available Research Upgrades</span>
              </h2>
              <span className="text-[10px] font-mono bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-violet-400 font-bold">
                {researchesByStatus.available.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {researchesByStatus.available.map(research => (
                <ResearchCard
                  key={research.id}
                  research={research}
                  status="available"
                  onStart={handleStartResearch}
                  canAfford={hasResources(research.cost)}
                  isResearching={!!currentResearch}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed Upgrades */}
        {researchesByStatus.completed.length > 0 && (
          <section className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-4.5 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <h2 className="font-display text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <CheckIcon size={16} className="text-emerald-400" strokeWidth={3} />
                <span>Perfected Researches</span>
              </h2>
              <span className="text-[10px] font-mono bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-emerald-400 font-bold">
                {researchesByStatus.completed.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {researchesByStatus.completed.map(research => (
                <ResearchCard
                  key={research.id}
                  research={research}
                  status="completed"
                />
              ))}
            </div>
          </section>
        )}

        {/* Locked Fields */}
        {researchesByStatus.locked.length > 0 && (
          <section className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-4.5 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <h2 className="font-display text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <LockIcon size={16} className="text-slate-500" />
                <span>Locked Discoveries</span>
              </h2>
              <span className="text-[10px] font-mono bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-600 font-bold">
                {researchesByStatus.locked.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {researchesByStatus.locked.map(research => (
                <ResearchCard
                  key={research.id}
                  research={research}
                  status="locked"
                  corpsesProcessed={stats.total_corpses_processed}
                  buildingsBuilt={stats.total_buildings_built}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

interface ResearchCardProps {
  research: Research;
  status: 'available' | 'locked' | 'completed';
  onStart?: (id: string) => void;
  canAfford?: boolean;
  isResearching?: boolean;
  corpsesProcessed?: number;
  buildingsBuilt?: number;
}

function ResearchCard({ research, status, onStart, canAfford, isResearching, corpsesProcessed, buildingsBuilt }: ResearchCardProps) {
  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:scale-[1.01] ${
      status === 'completed' ? 'bg-slate-950/20 border-emerald-500/25 opacity-65 shadow-md' :
      status === 'locked' ? 'bg-slate-950/50 border-slate-900 opacity-40 shadow-sm' :
      'bg-slate-950/45 border-violet-500/20 hover:border-violet-500/40 shadow-lg'
    }`}>
      <div>
        {/* Header */}
        <div className="flex items-start gap-3 mb-3 border-b border-slate-900/60 pb-2">
          <span className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.05)]">
            <ResearchIcon name={research.icon} size={30} />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-200">{research.name}</h3>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block mt-0.5">
              {RESEARCH_CATEGORIES[research.category].name}
            </span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-xs text-slate-400 italic leading-relaxed mb-4">{research.description}</p>
      </div>
      
      <div>
        {/* Cost & Requirements details */}
        {status !== 'completed' && (
          <div className="flex flex-col gap-2 mb-4">
            {/* Cost Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block self-center">Cost:</span>
              {Object.entries(research.cost).map(([res, amt]) => (
                <span key={res} className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  {amt} {res.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            
            {/* Prerequisites & Requirements */}
            {status === 'locked' && (
              <div className="bg-slate-900/60 border border-slate-900 p-2 rounded-lg flex flex-col gap-1 text-[10px] font-mono">
                {research.prerequisites.length > 0 && (
                  <div className="text-slate-500">
                    Requires: {research.prerequisites.map(id => RESEARCHES[id]?.name).join(', ')}
                  </div>
                )}
                {research.requiredCorpsesProcessed && (
                  <div className={`flex items-center gap-1 ${corpsesProcessed && corpsesProcessed >= research.requiredCorpsesProcessed ? 'text-emerald-500' : 'text-slate-500'}`}>
                    <CorpseIcon size={12} className="text-slate-500" />
                    <span>Corpses: {corpsesProcessed}/{research.requiredCorpsesProcessed}</span>
                  </div>
                )}
                {research.requiredBuildingsBuilt && (
                  <div className={`flex items-center gap-1 ${buildingsBuilt && buildingsBuilt >= research.requiredBuildingsBuilt ? 'text-emerald-500' : 'text-slate-500'}`}>
                    <StructuresIcon size={12} className="text-slate-500" />
                    <span>Structures: {buildingsBuilt}/{research.requiredBuildingsBuilt}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Card Footer Duration & Action */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <ClockIcon size={12} className="text-slate-500" />
            <span>Duration: {research.duration}s</span>
          </span>
          
          {status === 'available' && (
            <button
              onClick={() => onStart?.(research.id)}
              disabled={!canAfford || isResearching}
              className={`px-4 py-2 rounded-lg font-display text-[9px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 cursor-pointer ${
                canAfford && !isResearching
                  ? 'bg-violet-600/10 hover:bg-violet-600/25 border border-violet-500/25 hover:border-violet-500/55 text-violet-300'
                  : 'bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed'
              }`}
            >
              {isResearching ? 'Lab busy' : canAfford ? 'Research' : 'No Resources'}
            </button>
          )}

          {status === 'completed' && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-display text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
              <CheckIcon size={12} className="text-emerald-400" />
              <span>Completed</span>
            </div>
          )}

          {status === 'locked' && (
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-500 text-center font-display text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
              <LockIcon size={12} className="text-slate-500" />
              <span>Locked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
