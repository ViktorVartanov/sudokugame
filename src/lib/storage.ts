const PREFIX = 'sudoku-prime';

export const STORAGE_KEYS = {
  progress: `${PREFIX}:progress`,
  achievements: `${PREFIX}:achievements`,
  settings: `${PREFIX}:settings`,
  activeGame: `${PREFIX}:active-game`,
  dailyChallenge: `${PREFIX}:daily-challenge`,
  learnProgress: `${PREFIX}:learn-progress`,
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private browsing, quota exceeded); fail silently.
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}
