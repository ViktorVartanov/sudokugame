import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode, ColorTheme } from '../types/sudoku';
import type { Language } from '../lib/i18n';
import { STORAGE_KEYS } from '../lib/storage';
import { AVATAR_OPTIONS } from '../lib/avatars';

interface SettingsState {
  theme: ThemeMode;
  colorTheme: ColorTheme;
  language: Language;
  /** Shown on shared battle/result links — just a local display name, no account behind it. */
  nickname: string;
  avatarEmoji: string;
  /** Whether the first-launch onboarding carousel has been shown (skipped or completed either way). */
  hasSeenOnboarding: boolean;

  smartHints: boolean;
  coachMode: boolean;
  explainMistakes: boolean;

  antiStressMode: boolean;
  showTimer: boolean;
  soundEffects: boolean;
  relaxedMistakes: boolean;
  notesAutoClean: boolean;
  useLevelVisual: boolean;
  themeSounds: boolean;

  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setColorTheme: (theme: ColorTheme) => void;
  setLanguage: (language: Language) => void;
  setNickname: (nickname: string) => void;
  setAvatarEmoji: (emoji: string) => void;
  completeOnboarding: () => void;

  toggleSmartHints: () => void;
  toggleCoachMode: () => void;
  toggleExplainMistakes: () => void;
  toggleAntiStressMode: () => void;
  toggleShowTimer: () => void;
  toggleSoundEffects: () => void;
  toggleRelaxedMistakes: () => void;
  toggleNotesAutoClean: () => void;
  toggleUseLevelVisual: () => void;
  toggleThemeSounds: () => void;

  resetSettings: () => void;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

const DEFAULTS = {
  theme: getInitialTheme(),
  colorTheme: 'default' as ColorTheme,
  language: getInitialLanguage(),
  nickname: '',
  avatarEmoji: AVATAR_OPTIONS[0],
  hasSeenOnboarding: false,
  smartHints: true,
  coachMode: false,
  explainMistakes: false,
  antiStressMode: false,
  showTimer: true,
  soundEffects: false,
  relaxedMistakes: false,
  notesAutoClean: true,
  useLevelVisual: true,
  themeSounds: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),

      setColorTheme: (colorTheme) => set({ colorTheme }),
      setLanguage: (language) => set({ language }),
      setNickname: (nickname) => set({ nickname }),
      setAvatarEmoji: (avatarEmoji) => set({ avatarEmoji }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),

      toggleSmartHints: () => set({ smartHints: !get().smartHints }),
      toggleCoachMode: () => set({ coachMode: !get().coachMode }),
      toggleExplainMistakes: () => set({ explainMistakes: !get().explainMistakes }),
      // A convenience preset: turning it on batch-applies a calmer setup, but
      // the two toggles stay independently adjustable afterward rather than
      // being permanently locked together.
      toggleAntiStressMode: () => {
        const next = !get().antiStressMode;
        set(
          next
            ? { antiStressMode: true, showTimer: false, relaxedMistakes: true }
            : { antiStressMode: false, showTimer: true, relaxedMistakes: false },
        );
      },
      toggleShowTimer: () => set({ showTimer: !get().showTimer }),
      toggleSoundEffects: () => set({ soundEffects: !get().soundEffects }),
      toggleRelaxedMistakes: () => set({ relaxedMistakes: !get().relaxedMistakes }),
      toggleNotesAutoClean: () => set({ notesAutoClean: !get().notesAutoClean }),
      toggleUseLevelVisual: () => set({ useLevelVisual: !get().useLevelVisual }),
      toggleThemeSounds: () => set({ themeSounds: !get().themeSounds }),

      resetSettings: () =>
        set({
          ...DEFAULTS,
          theme: get().theme,
          language: get().language,
          nickname: get().nickname,
          avatarEmoji: get().avatarEmoji,
          hasSeenOnboarding: get().hasSeenOnboarding,
        }),
    }),
    {
      name: STORAGE_KEYS.settings,
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<SettingsState>) }),
    },
  ),
);
