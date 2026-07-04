import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../lib/storage';

interface LearnState {
  completedLessons: string[];
  markLessonComplete: (id: string) => void;
  isLessonComplete: (id: string) => boolean;
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      markLessonComplete: (id) => {
        if (get().completedLessons.includes(id)) return;
        set((state) => ({ completedLessons: [...state.completedLessons, id] }));
      },
      isLessonComplete: (id) => get().completedLessons.includes(id),
    }),
    { name: STORAGE_KEYS.learnProgress },
  ),
);
