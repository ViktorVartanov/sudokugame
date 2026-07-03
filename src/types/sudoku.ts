/** A 9x9 grid of digits, where 0 represents an empty cell. */
export type Grid = number[][];

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellState {
  /** Current value in the cell, 0 when empty. */
  value: number;
  /** True if this cell was part of the original puzzle and cannot be edited. */
  isGiven: boolean;
  /** Pencil-mark candidates the player has noted, 1-9, unsorted-safe. */
  notes: number[];
  /** True once the cell was filled in via the hint action. */
  wasHinted: boolean;
}

export type Board = CellState[][];

export interface PuzzleData {
  puzzle: Grid;
  solution: Grid;
}

export interface DifficultyLevel {
  id: number;
  key: string;
  name: string;
  tagline: string;
  clues: number;
  gradient: string;
  ring: string;
}

export interface LevelProgress {
  bestTimeSeconds: number | null;
  bestMistakes: number | null;
  timesCompleted: number;
  stars: number;
}

export type ProgressMap = Record<number, LevelProgress>;

export interface ActiveGameSnapshot {
  levelId: number;
  seed?: number;
  puzzle: Grid;
  solution: Grid;
  cells: {
    value: number;
    isGiven: boolean;
    notes: number[];
    wasHinted: boolean;
  }[][];
  mistakes: number;
  hintsUsed: number;
  elapsedSeconds: number;
  notesMode: boolean;
  isComplete: boolean;
  startedAt: number;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AchievementProgress {
  unlocked: boolean;
  unlockedAt: number | null;
}

export type AchievementsMap = Record<string, AchievementProgress>;

export type ThemeMode = 'light' | 'dark';

export type ColorTheme = 'default' | 'sakura' | 'ocean' | 'neon' | 'sunset';

export type GameMessageTone = 'hint' | 'coach' | 'mistake';

export interface GameMessage {
  text: string;
  tone: GameMessageTone;
}

export interface ConflictHighlight {
  kind: 'row' | 'col' | 'box';
  row: number;
  col: number;
}
