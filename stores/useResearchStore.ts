'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { ResearchState, ResearchProgress } from '@/types/research';
import { RESEARCHES } from '@/lib/game/researches';

interface ResearchStore extends ResearchState {
  // Actions
  startResearch: (researchId: string) => boolean;
  cancelResearch: () => void;
  completeResearch: (researchId: string) => void;
  updateResearchProgress: (delta: number) => void;
  
  // Queries
  isResearchCompleted: (researchId: string) => boolean;
  isResearchAvailable: (researchId: string, corpsesProcessed: number, buildingsBuilt: number) => boolean;
  getResearchStatus: (researchId: string, corpsesProcessed: number, buildingsBuilt: number) => 'locked' | 'available' | 'researching' | 'completed';
}

const INITIAL_STATE: ResearchState = {
  completedResearches: [],
  currentResearch: null,
  availableResearches: [],
};

export const useResearchStore = create<ResearchStore>()(
  persist(
    immer((set, get) => ({
      ...INITIAL_STATE,

      startResearch: (researchId) => {
        const state = get();
        if (state.currentResearch) return false; // Already researching
        
        const research = RESEARCHES[researchId];
        if (!research) return false;
        
        set((s) => {
          s.currentResearch = {
            researchId,
            startedAt: Date.now(),
            progress: 0,
          };
        });
        
        return true;
      },

      cancelResearch: () => {
        set((s) => {
          s.currentResearch = null;
        });
      },

      completeResearch: (researchId) => {
        set((s) => {
          if (!s.completedResearches.includes(researchId)) {
            s.completedResearches.push(researchId);
          }
          s.currentResearch = null;
        });
      },

      updateResearchProgress: (delta) => {
        set((s) => {
          if (s.currentResearch) {
            const research = RESEARCHES[s.currentResearch.researchId];
            if (research) {
              s.currentResearch.progress += (delta / research.duration) * 100;
              
              // Auto-complete when progress reaches 100%
              if (s.currentResearch.progress >= 100) {
                if (!s.completedResearches.includes(s.currentResearch.researchId)) {
                  s.completedResearches.push(s.currentResearch.researchId);
                }
                s.currentResearch = null;
              }
            }
          }
        });
      },

      isResearchCompleted: (researchId) => {
        return get().completedResearches.includes(researchId);
      },

      isResearchAvailable: (researchId, corpsesProcessed, buildingsBuilt) => {
        const state = get();
        const research = RESEARCHES[researchId];
        if (!research) return false;
        
        // Check if already completed
        if (state.completedResearches.includes(researchId)) return false;
        
        // Check prerequisites
        const prereqsMet = research.prerequisites.every(prereqId => 
          state.completedResearches.includes(prereqId)
        );
        if (!prereqsMet) return false;
        
        // Check corpses requirement
        if (research.requiredCorpsesProcessed && corpsesProcessed < research.requiredCorpsesProcessed) {
          return false;
        }
        
        // Check buildings requirement
        if (research.requiredBuildingsBuilt && buildingsBuilt < research.requiredBuildingsBuilt) {
          return false;
        }
        
        return true;
      },

      getResearchStatus: (researchId, corpsesProcessed, buildingsBuilt) => {
        const state = get();
        
        if (state.completedResearches.includes(researchId)) {
          return 'completed';
        }
        
        if (state.currentResearch?.researchId === researchId) {
          return 'researching';
        }
        
        if (state.isResearchAvailable(researchId, corpsesProcessed, buildingsBuilt)) {
          return 'available';
        }
        
        return 'locked';
      },
    })),
    {
      name: 'necroconomics-research-state',
      version: 1,
    }
  )
);
