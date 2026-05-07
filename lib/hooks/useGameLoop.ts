/**
 * Custom hooks for game interactions
 */

'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { GAME_CONFIG } from '@/lib/game/constants';
import { calculateOfflineProgress } from '@/lib/game/calculations';

/**
 * Main game loop hook
 * Processes ticks and handles offline progress
 */
export function useGameLoop() {
  const processTick = useGameStore((state) => state.processTick);
  const tick = useGameStore((state) => state.tick);
  const lastSaved = useGameStore((state) => state.lastSaved);
  const loadGame = useGameStore((state) => state.loadGame);

  useEffect(() => {
    // Calculate offline progress on mount
    const offlineTicks = calculateOfflineProgress(lastSaved, GAME_CONFIG.OFFLINE_PROGRESS_CAP);
    if (offlineTicks > 0) {
      // Apply offline progress
      for (let i = 0; i < offlineTicks; i++) {
        processTick();
      }
    }
  }, []);

  useEffect(() => {
    // Main game loop
    const interval = setInterval(() => {
      processTick();
    }, GAME_CONFIG.TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [processTick]);

  // Pause on tab invisibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, game loop will continue but we'll track time
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return { tick };
}

/**
 * Hook for detecting critical resource conditions
 */
export function useCriticalResources() {
  const resources = useGameStore((state) => state.resources);

  return {
    isCorpseCritical: resources.corpse < 5,
    isBonesLow: resources.bone < 10,
    canAfford: (requiredResources: Partial<typeof resources>) => {
      return Object.entries(requiredResources).every(
        ([key, amount]) => resources[key as keyof typeof resources] >= (amount || 0)
      );
    },
  };
}
