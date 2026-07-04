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

export interface WorldVisualTokens {
  bg: string;
  bgDark: string;
  surface: string;
  surfaceSoft: string;
  board: string;
  boardAlt: string;
  ink: string;
  muted: string;
  line: string;
  heavyLine: string;
  accent: string;
  accent2: string;
  glowRgb: string;
  completeRgb: string;
  shadow: string;
}

export interface StoryWorld {
  levelId: number;
  key: string;
  gradient: string;
  glow: string;
  visualTheme?: Exclude<ColorTheme, 'default'>;
  visualColor?: string;
  motif: WorldMotif;
  victoryIcon: string;
  decorations: string[];
  ambientProfile: AmbientProfile;
  visual: WorldVisualTokens;
  icon: string;
  quote: string;
}

export const STORY_WORLDS: StoryWorld[] = [
  {
    levelId: 1,
    key: 'morning-cafe',
    gradient: 'from-amber-300 to-orange-400',
    glow: 'shadow-amber-400/30',
    visualColor: '#78905f',
    motif: 'steam',
    victoryIcon: 'Coffee',
    decorations: ['☕', '🥐'],
    ambientProfile: 'warm-pad',
    icon: '☕',
    quote: 'Take a deep breath and enjoy the calm of the morning.',
    visual: {
      bg: '#f6efe4',
      bgDark: '#21160f',
      surface: '#fff8ec',
      surfaceSoft: '#efe1cc',
      board: '#fff7e8',
      boardAlt: '#f1dfc4',
      ink: '#332417',
      muted: '#7f6d58',
      line: '#c9ad8a',
      heavyLine: '#9c7a56',
      accent: '#78905f',
      accent2: '#b77a3a',
      glowRgb: '183, 122, 58',
      completeRgb: '120, 144, 95',
      shadow: 'rgba(91, 55, 24, 0.26)',
    },
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
    icon: '📚',
    quote: 'A quiet mind sees patterns others miss.',
    visual: {
      bg: '#2a170d',
      bgDark: '#160d08',
      surface: '#ead5b4',
      surfaceSoft: '#7b4b24',
      board: '#f1ddbc',
      boardAlt: '#d8b987',
      ink: '#2d1a0e',
      muted: '#c69d62',
      line: '#b17a42',
      heavyLine: '#70451e',
      accent: '#c7923f',
      accent2: '#7a4a22',
      glowRgb: '199, 146, 63',
      completeRgb: '220, 165, 73',
      shadow: 'rgba(0, 0, 0, 0.36)',
    },
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
    icon: '☔',
    quote: 'Let the rain sharpen your mind.',
    visual: {
      bg: '#102133',
      bgDark: '#07111d',
      surface: '#223344',
      surfaceSoft: '#172636',
      board: '#dfe7ec',
      boardAlt: '#b8c8d2',
      ink: '#172232',
      muted: '#9fb4c7',
      line: '#8da2b3',
      heavyLine: '#536a7f',
      accent: '#6ba6d8',
      accent2: '#d39a58',
      glowRgb: '107, 166, 216',
      completeRgb: '107, 166, 216',
      shadow: 'rgba(1, 9, 18, 0.45)',
    },
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
    icon: '🌸',
    quote: 'Blossom with every number.',
    visual: {
      bg: '#fff0f0',
      bgDark: '#2b1119',
      surface: '#fff7f5',
      surfaceSoft: '#f5cfd0',
      board: '#fff6f2',
      boardAlt: '#f7dddd',
      ink: '#42231d',
      muted: '#b27776',
      line: '#d7a5a0',
      heavyLine: '#a46a63',
      accent: '#df8d95',
      accent2: '#be675e',
      glowRgb: '223, 141, 149',
      completeRgb: '223, 141, 149',
      shadow: 'rgba(178, 97, 103, 0.22)',
    },
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
    icon: '🌊',
    quote: 'Take a deep breath and enjoy the calm of the ocean.',
    visual: {
      bg: '#ecf8f7',
      bgDark: '#061b22',
      surface: '#f8f6ec',
      surfaceSoft: '#c7e7e4',
      board: '#f7fbf8',
      boardAlt: '#d7f0ef',
      ink: '#083846',
      muted: '#4a7e87',
      line: '#80b6bd',
      heavyLine: '#2d7784',
      accent: '#3a9aa4',
      accent2: '#d7be87',
      glowRgb: '58, 154, 164',
      completeRgb: '58, 154, 164',
      shadow: 'rgba(20, 97, 108, 0.22)',
    },
  },
  {
    levelId: 6,
    key: 'night-city',
    gradient: 'from-indigo-600 to-purple-800',
    glow: 'shadow-purple-600/30',
    visualColor: '#e0b93c',
    motif: 'grid',
    victoryIcon: 'Building2',
    decorations: ['🌃', '🚕'],
    ambientProfile: 'synth-pulse',
    icon: '🏙️',
    quote: 'Take a deep breath and enjoy the calm of the night.',
    visual: {
      bg: '#08111b',
      bgDark: '#04090f',
      surface: '#111c29',
      surfaceSoft: '#192636',
      board: '#121f2c',
      boardAlt: '#1c2d3e',
      ink: '#f2ede3',
      muted: '#a7b0bd',
      line: '#52606c',
      heavyLine: '#9299a1',
      accent: '#e0b93c',
      accent2: '#4e6377',
      glowRgb: '224, 185, 60',
      completeRgb: '224, 185, 60',
      shadow: 'rgba(0, 0, 0, 0.5)',
    },
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
    icon: '⚡',
    quote: 'Solve the future, one line at a time.',
    visual: {
      bg: '#070815',
      bgDark: '#03040b',
      surface: '#0b1024',
      surfaceSoft: '#17113c',
      board: '#080f22',
      boardAlt: '#141d3b',
      ink: '#f4eaff',
      muted: '#b9a4df',
      line: '#496488',
      heavyLine: '#b889ff',
      accent: '#f04ac8',
      accent2: '#1ccde4',
      glowRgb: '240, 74, 200',
      completeRgb: '28, 205, 228',
      shadow: 'rgba(0, 0, 0, 0.55)',
    },
  },
  {
    levelId: 8,
    key: 'mountain-observatory',
    gradient: 'from-slate-600 to-indigo-900',
    glow: 'shadow-indigo-700/30',
    visualColor: '#8ea4c2',
    motif: 'stars-sparse',
    victoryIcon: 'Mountain',
    decorations: ['🔭', '⛰️'],
    ambientProfile: 'wind-drone',
    icon: '✦',
    quote: 'Thin air, clear mind, exact logic.',
    visual: {
      bg: '#111927',
      bgDark: '#080d15',
      surface: '#1a2534',
      surfaceSoft: '#26384b',
      board: '#151d29',
      boardAlt: '#223247',
      ink: '#edf2f8',
      muted: '#a5b5c9',
      line: '#4b5967',
      heavyLine: '#8d9aab',
      accent: '#8ea4c2',
      accent2: '#5d7898',
      glowRgb: '142, 164, 194',
      completeRgb: '142, 164, 194',
      shadow: 'rgba(0, 0, 0, 0.5)',
    },
  },
  {
    levelId: 9,
    key: 'space-station',
    gradient: 'from-violet-700 to-slate-900',
    glow: 'shadow-violet-700/30',
    visualColor: '#8d63e6',
    motif: 'stars-dense',
    victoryIcon: 'Rocket',
    decorations: ['🚀', '🪐'],
    ambientProfile: 'deep-space',
    icon: '🚀',
    quote: 'Sector 9 awaits a perfect solution.',
    visual: {
      bg: '#070913',
      bgDark: '#03040a',
      surface: '#101624',
      surfaceSoft: '#1d2035',
      board: '#0b1220',
      boardAlt: '#1b2135',
      ink: '#f5f4ff',
      muted: '#b4a7d9',
      line: '#4d566a',
      heavyLine: '#8b86a5',
      accent: '#8d63e6',
      accent2: '#aab5c8',
      glowRgb: '141, 99, 230',
      completeRgb: '141, 99, 230',
      shadow: 'rgba(0, 0, 0, 0.6)',
    },
  },
  {
    levelId: 10,
    key: 'grandmaster-hall',
    gradient: 'from-amber-500 to-red-700',
    glow: 'shadow-red-600/30',
    visualColor: '#d8ad52',
    motif: 'chevron',
    victoryIcon: 'Crown',
    decorations: ['👑', '♟️'],
    ambientProfile: 'regal-pad',
    icon: '♛',
    quote: 'Only the mind that remains calm wins the game.',
    visual: {
      bg: '#0d0b09',
      bgDark: '#050403',
      surface: '#15110d',
      surfaceSoft: '#2c1718',
      board: '#12100d',
      boardAlt: '#241716',
      ink: '#f2d38c',
      muted: '#b99855',
      line: '#6e572c',
      heavyLine: '#d8ad52',
      accent: '#d8ad52',
      accent2: '#8f3a35',
      glowRgb: '216, 173, 82',
      completeRgb: '216, 173, 82',
      shadow: 'rgba(0, 0, 0, 0.65)',
    },
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
  const brandVars = world.visualTheme ? THEME_VARIABLES[world.visualTheme] : generateScaleFromColor(world.visualColor!);
  return {
    ...brandVars,
    '--world-bg': world.visual.bg,
    '--world-bg-dark': world.visual.bgDark,
    '--world-surface': world.visual.surface,
    '--world-surface-soft': world.visual.surfaceSoft,
    '--world-board': world.visual.board,
    '--world-board-alt': world.visual.boardAlt,
    '--world-ink': world.visual.ink,
    '--world-muted': world.visual.muted,
    '--world-line': world.visual.line,
    '--world-heavy-line': world.visual.heavyLine,
    '--world-accent': world.visual.accent,
    '--world-accent-2': world.visual.accent2,
    '--world-glow-rgb': world.visual.glowRgb,
    '--world-complete-rgb': world.visual.completeRgb,
    '--world-shadow': world.visual.shadow,
  };
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
