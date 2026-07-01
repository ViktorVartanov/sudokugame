import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LevelProgress, ProgressMap } from '../types/sudoku';
import { DIFFICULTY_LEVELS } from '../lib/difficulty';
import { STORAGE_KEYS } from '../lib/storage';

interface WinResult {
  levelId: number;
  timeSeconds: number;
  mistakes: number;
  stars: number;
}

interface ProgressState {
  levels: ProgressMap;
  totalWins: number;
  totalTimePlayedSeconds: number;
  totalMistakesMade: number;
  recordWin: (result: WinResult) => { allLevelsCompleted: boolean; totalWinsAfterThis: number };
  getLevelProgress: (levelId: number) => LevelProgress;
}

function defaultProgress(): LevelProgress {
  return { bestTimeSeconds: null, bestMistakes: null, timesCompleted: 0, stars: 0 };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      levels: {},
      totalWins: 0,
      totalTimePlayedSeconds: 0,
      totalMistakesMade: 0,

      getLevelProgress: (levelId) => get().levels[levelId] ?? defaultProgress(),

      recordWin: ({ levelId, timeSeconds, mistakes, stars }) => {
        const state = get();
        const existing = state.levels[levelId] ?? defaultProgress();

        const updated: LevelProgress = {
          bestTimeSeconds:
            existing.bestTimeSeconds === null ? timeSeconds : Math.min(existing.bestTimeSeconds, timeSeconds),
          bestMistakes: existing.bestMistakes === null ? mistakes : Math.min(existing.bestMistakes, mistakes),
          timesCompleted: existing.timesCompleted + 1,
          stars: Math.max(existing.stars, stars),
        };

        const nextLevels = { ...state.levels, [levelId]: updated };
        const totalWinsAfterThis = state.totalWins + 1;

        set({
          levels: nextLevels,
          totalWins: totalWinsAfterThis,
          totalTimePlayedSeconds: state.totalTimePlayedSeconds + timeSeconds,
          totalMistakesMade: state.totalMistakesMade + mistakes,
        });

        const allLevelsCompleted = DIFFICULTY_LEVELS.every(
          (level) => (nextLevels[level.id]?.timesCompleted ?? 0) > 0,
        );

        return { allLevelsCompleted, totalWinsAfterThis };
      },
    }),
    { name: STORAGE_KEYS.progress },
  ),
);
