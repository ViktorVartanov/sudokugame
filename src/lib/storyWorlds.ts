import type { ColorTheme, ProgressMap } from '../types/sudoku';
import { THEME_VARIABLES, generateScaleFromColor } from './themes';

export type WorldMotif =
  | 'steam'
  | 'stripes'
  | 'rain'
  | 'petals'
  | 'waves'
  | 'grid'
  | 'circuit'
  | 'stars-sparse'
  | 'stars-dense'
  | 'chevron';

/** Named presets for the procedural WebAudio ambient loop (see lib/ambientSound.ts) — no audio files, so nothing to bundle for offline. */
export type AmbientProfile =
  | 'warm-pad'
  | 'quiet-drone'
  | 'rain-noise'
  | 'chime'
  | 'wave-noise'
  | 'synth-pulse'
  | 'neon-arp'
  | 'wind-drone'
  | 'deep-space'
  | 'regal-pad';

export interface StoryWorld {
  levelId: number;
  key: string;
  gradient: string;
  glow: string;
  /** Reuses an existing base theme's full palette when the world's mood already matches one. */
  visualTheme?: Exclude<ColorTheme, 'default'>;
  /** Otherwise, a signature color a full brand scale gets generated from (see lib/themes.ts). */
  visualColor?: string;
  /** Background/frame decoration pattern — drives both the page's `.motif-*` background and the board's `.frame-*` texture (see index.css), applied only when Level Visual is on. */
  motif: WorldMotif;
  /** Icon name (key into ICONS maps in VictoryModal/GrandmasterVictory) shown to celebrate finishing this world. */
  victoryIcon: string;
  /** 2-3 emoji floated as faint decoration around the game screen — system-font glyphs, so nothing to fetch or bundle. */
  decorations: string[];
  /** Procedurally synthesized (no audio files) ambient loop, played only when the "Theme Sounds" setting is on. */
  ambientProfile: AmbientProfile;
}

export const STORY_WORLDS: StoryWorld[] = [
  {
    levelId: 1,
    key: 'morning-cafe',
    gradient: 'from-amber-300 to-orange-400',
    glow: 'shadow-amber-400/30',
    visualColor: '#f2994a',
    motif: 'steam',
    victoryIcon: 'Coffee',
    decorations: ['☕', '🥐'],
    ambientProfile: 'warm-pad',
  },
  {
    levelId: 2,
    key: 'quiet-library',
    gradient: 'from-yellow-600 to-amber-800',
    glow: 'shadow-amber-700/30',
    visualColor: '#b8860b',
    motif: 'stripes',
    victoryIcon: 'BookOpen',
    decorations: ['📚', '🕯️'],
    ambientProfile: 'quiet-drone',
  },
  {
    levelId: 3,
    key: 'rainy-evening',
    gradient: 'from-slate-400 to-blue-600',
    glow: 'shadow-blue-500/30',
    visualColor: '#5b7c99',
    motif: 'rain',
    victoryIcon: 'CloudRain',
    decorations: ['☂️', '💧'],
    ambientProfile: 'rain-noise',
  },
  {
    levelId: 4,
    key: 'sakura-park',
    gradient: 'from-pink-300 to-rose-500',
    glow: 'shadow-rose-400/30',
    visualTheme: 'sakura',
    motif: 'petals',
    victoryIcon: 'Flower2',
    decorations: ['🌸', '🦋'],
    ambientProfile: 'chime',
  },
  {
    levelId: 5,
    key: 'ocean-shore',
    gradient: 'from-cyan-400 to-blue-600',
    glow: 'shadow-blue-500/30',
    visualTheme: 'ocean',
    motif: 'waves',
    victoryIcon: 'Waves',
    decorations: ['🐚', '🌊'],
    ambientProfile: 'wave-noise',
  },
  {
    levelId: 6,
    key: 'night-city',
    gradient: 'from-indigo-600 to-purple-800',
    glow: 'shadow-purple-600/30',
    visualColor: '#6d28d9',
    motif: 'grid',
    victoryIcon: 'Building2',
    decorations: ['🌃', '🚕'],
    ambientProfile: 'synth-pulse',
  },
  {
    levelId: 7,
    key: 'neon-district',
    gradient: 'from-fuchsia-500 to-purple-700',
    glow: 'shadow-fuchsia-500/30',
    visualTheme: 'neon',
    motif: 'circuit',
    victoryIcon: 'Zap',
    decorations: ['⚡', '🌆'],
    ambientProfile: 'neon-arp',
  },
  {
    levelId: 8,
    key: 'mountain-observatory',
    gradient: 'from-slate-600 to-indigo-900',
    glow: 'shadow-indigo-700/30',
    visualColor: '#475569',
    motif: 'stars-sparse',
    victoryIcon: 'Mountain',
    decorations: ['🔭', '⛰️'],
    ambientProfile: 'wind-drone',
  },
  {
    levelId: 9,
    key: 'space-station',
    gradient: 'from-violet-700 to-slate-900',
    glow: 'shadow-violet-700/30',
    visualColor: '#7c3aed',
    motif: 'stars-dense',
    victoryIcon: 'Rocket',
    decorations: ['🚀', '🪐'],
    ambientProfile: 'deep-space',
  },
  {
    levelId: 10,
    key: 'grandmaster-hall',
    gradient: 'from-amber-500 to-red-700',
    glow: 'shadow-red-600/30',
    visualColor: '#b45309',
    motif: 'chevron',
    victoryIcon: 'Crown',
    decorations: ['👑', '♟️'],
    ambientProfile: 'regal-pad',
  },
];

export function getStoryWorld(levelId: number): StoryWorld {
  const world = STORY_WORLDS.find((w) => w.levelId === levelId);
  if (!world) throw new Error(`Unknown story world for level id: ${levelId}`);
  return world;
}

/** Level 1 always starts unlocked; each subsequent world unlocks once the previous one has been won at least once. */
export function isLevelUnlocked(levelId: number, levels: ProgressMap): boolean {
  if (levelId === 1) return true;
  return (levels[levelId - 1]?.timesCompleted ?? 0) > 0;
}

function getWorldVariables(world: StoryWorld): Record<string, string> {
  return world.visualTheme ? THEME_VARIABLES[world.visualTheme] : generateScaleFromColor(world.visualColor!);
}

/** Re-skins the app to match the given level's story-world mood for the duration of gameplay (see GameScreen). */
export function applyLevelVisual(levelId: number): void {
  const vars = getWorldVariables(getStoryWorld(levelId));
  const root = document.documentElement.style;
  for (const [name, value] of Object.entries(vars)) {
    root.setProperty(name, value);
  }
}

/** Real hex colors (not Tailwind class names) for contexts that can't read CSS variables, like <canvas> share cards. */
export function getWorldHexGradient(levelId: number): { from: string; to: string } {
  const vars = getWorldVariables(getStoryWorld(levelId));
  return { from: vars['--color-brand-400'], to: vars['--color-brand-700'] };
}
