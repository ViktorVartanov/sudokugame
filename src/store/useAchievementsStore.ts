import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AchievementsMap } from '../types/sudoku';
import { createEmptyAchievementsMap, evaluateNewAchievements, type AchievementContext } from '../lib/achievements';
import { STORAGE_KEYS } from '../lib/storage';

interface AchievementsState {
  unlocked: AchievementsMap;
  /** Evaluates a win, persists any newly-unlocked achievements, and returns their ids. */
  checkForNewAchievements: (ctx: AchievementContext) => string[];
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      unlocked: createEmptyAchievementsMap(),

      checkForNewAchievements: (ctx) => {
        const current = get().unlocked;
        const newIds = evaluateNewAchievements(ctx, current);
        if (newIds.length === 0) return [];

        const now = Date.now();
        const updated = { ...current };
        for (const id of newIds) {
          updated[id] = { unlocked: true, unlockedAt: now };
        }
        set({ unlocked: updated });
        return newIds;
      },
    }),
    {
      name: STORAGE_KEYS.achievements,
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AchievementsState>),
        unlocked: {
          ...createEmptyAchievementsMap(),
          ...(persisted as Partial<AchievementsState>)?.unlocked,
        },
      }),
    },
  ),
);
