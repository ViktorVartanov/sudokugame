import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../lib/storage';
import { getPreviousDateString, getTodayDateString } from '../lib/dailyChallenge';

export interface DailyCompletionRecord {
  timeSeconds: number;
  mistakes: number;
  hintsUsed: number;
  stars: number;
  completedAt: number;
}

interface DailyChallengeState {
  /** dateString ('YYYY-MM-DD') -> best completion recorded for that day. */
  history: Record<string, DailyCompletionRecord>;
  recordCompletion: (dateString: string, record: DailyCompletionRecord) => void;
  isCompleted: (dateString: string) => boolean;
  /** Consecutive days ending today (or yesterday, if today isn't done yet — a streak isn't broken until a day is fully missed). */
  getStreak: () => number;
  getBestStreak: () => number;
  getBestTime: () => number | null;
  getTotalCompleted: () => number;
}

export const useDailyChallengeStore = create<DailyChallengeState>()(
  persist(
    (set, get) => ({
      history: {},

      recordCompletion: (dateString, record) => {
        set((state) => {
          const existing = state.history[dateString];
          if (existing && existing.timeSeconds <= record.timeSeconds) return state;
          return { history: { ...state.history, [dateString]: record } };
        });
      },

      isCompleted: (dateString) => !!get().history[dateString],

      getStreak: () => {
        const history = get().history;
        let cursor = getTodayDateString();
        if (!history[cursor]) cursor = getPreviousDateString(cursor);
        let streak = 0;
        while (history[cursor]) {
          streak += 1;
          cursor = getPreviousDateString(cursor);
        }
        return streak;
      },

      getBestStreak: () => {
        const dates = Object.keys(get().history).sort();
        if (dates.length === 0) return 0;
        let best = 1;
        let current = 1;
        for (let i = 1; i < dates.length; i++) {
          current = getPreviousDateString(dates[i]) === dates[i - 1] ? current + 1 : 1;
          best = Math.max(best, current);
        }
        return best;
      },

      getBestTime: () => {
        const times = Object.values(get().history).map((r) => r.timeSeconds);
        return times.length === 0 ? null : Math.min(...times);
      },

      getTotalCompleted: () => Object.keys(get().history).length,
    }),
    { name: STORAGE_KEYS.dailyChallenge },
  ),
);
