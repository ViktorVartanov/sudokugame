/**
 * Date-seeded daily challenge — same puzzle for everyone on a given calendar
 * day, computed purely from the date string, no backend/server clock needed.
 */

export function getTodayDateString(): string {
  return dateToString(new Date());
}

export function getPreviousDateString(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return dateToString(date);
}

function dateToString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** FNV-1a — deterministic and fast, good enough to turn a date string into a stable 32-bit seed. */
function hashStringToSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function getDailySeed(dateString: string): number {
  return hashStringToSeed(`daily-challenge-${dateString}`);
}

/** Cycles the difficulty by weekday (index = Date#getDay(), 0=Sunday) for variety, staying in the easy-to-hard middle of the range rather than the two extremes. */
const DAILY_WEEKDAY_LEVEL_IDS = [3, 2, 4, 5, 5, 6, 7] as const;

export function getDailyLevelId(dateString: string): number {
  const date = new Date(`${dateString}T00:00:00`);
  return DAILY_WEEKDAY_LEVEL_IDS[date.getDay()];
}
