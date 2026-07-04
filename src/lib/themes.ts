import type { ColorTheme } from '../types/sudoku';

/**
 * Per-theme CSS custom property overrides. Every `bg-brand-*`, `text-brand-*`,
 * `ring-brand-*`, `shadow-brand-*` utility across the app compiles (Tailwind v4)
 * to `var(--color-brand-500)` etc., so setting these variables re-skins the
 * whole app — board, buttons, cards, victory screens, settings — without
 * touching component markup.
 *
 * Applied imperatively via `applyColorTheme` (element.style.setProperty)
 * rather than static CSS rules: a Lightning CSS optimizer bug was found to
 * silently drop the first of several adjacent CSS rules that redeclare the
 * same custom-property set, so inline styles are used instead.
 */
export const THEME_VARIABLES: Record<Exclude<ColorTheme, 'default'>, Record<string, string>> = {
  sakura: {
    '--color-brand-50': '#fff1f6',
    '--color-brand-100': '#ffe0ec',
    '--color-brand-200': '#ffc2d9',
    '--color-brand-300': '#ff9dc2',
    '--color-brand-400': '#fb7dae',
    '--color-brand-500': '#f4568f',
    '--color-brand-600': '#e13d76',
    '--color-brand-700': '#c02a5e',
    '--color-brand-800': '#9c2350',
    '--color-brand-900': '#7d1f44',
    '--app-bg-light': '#fff5f8',
    '--app-bg-dark': '#1a0f14',
    '--noise-rgb': '244, 86, 143',
  },
  ocean: {
    '--color-brand-50': '#eef8ff',
    '--color-brand-100': '#d9efff',
    '--color-brand-200': '#b3dfff',
    '--color-brand-300': '#7cc8ff',
    '--color-brand-400': '#3ea9f5',
    '--color-brand-500': '#1c8ce0',
    '--color-brand-600': '#0f6fc0',
    '--color-brand-700': '#0c599c',
    '--color-brand-800': '#0e4a7d',
    '--color-brand-900': '#103e67',
    '--app-bg-light': '#eff8ff',
    '--app-bg-dark': '#061422',
    '--noise-rgb': '28, 140, 224',
  },
  neon: {
    '--color-brand-50': '#fdf2ff',
    '--color-brand-100': '#f9def8',
    '--color-brand-200': '#f2b7f0',
    '--color-brand-300': '#ea8bf0',
    '--color-brand-400': '#e35bf5',
    '--color-brand-500': '#c81ee6',
    '--color-brand-600': '#a30fc2',
    '--color-brand-700': '#7f0a99',
    '--color-brand-800': '#5f0777',
    '--color-brand-900': '#470560',
    '--color-accent-50': '#ecfffb',
    '--color-accent-100': '#cbfff2',
    '--color-accent-200': '#96ffe6',
    '--color-accent-400': '#22e8d8',
    '--color-accent-500': '#0dcdbe',
    '--color-accent-600': '#08a99d',
    '--app-bg-light': '#f5f0ff',
    '--app-bg-dark': '#06040f',
    '--noise-rgb': '217, 60, 255',
  },
  sunset: {
    '--color-brand-50': '#fff7ed',
    '--color-brand-100': '#ffedd5',
    '--color-brand-200': '#fed7aa',
    '--color-brand-300': '#fdba74',
    '--color-brand-400': '#fb923c',
    '--color-brand-500': '#f2751b',
    '--color-brand-600': '#ea580c',
    '--color-brand-700': '#c2410c',
    '--color-brand-800': '#9a3412',
    '--color-brand-900': '#7c2d12',
    '--app-bg-light': '#fff8f0',
    '--app-bg-dark': '#1a0f08',
    '--noise-rgb': '249, 115, 22',
  },
};

/** The full set of variable names any theme might set, so switching back to 'default' clears all of them. */
const WORLD_VARIABLE_NAMES = [
  '--world-bg',
  '--world-bg-dark',
  '--world-surface',
  '--world-surface-soft',
  '--world-board',
  '--world-board-alt',
  '--world-ink',
  '--world-muted',
  '--world-line',
  '--world-heavy-line',
  '--world-accent',
  '--world-accent-2',
  '--world-glow-rgb',
  '--world-complete-rgb',
  '--world-shadow',
];

const ALL_VARIABLE_NAMES = Array.from(
  new Set([...Object.values(THEME_VARIABLES).flatMap((vars) => Object.keys(vars)), ...WORLD_VARIABLE_NAMES]),
);

export function applyColorTheme(theme: ColorTheme): void {
  const root = document.documentElement.style;

  for (const name of ALL_VARIABLE_NAMES) {
    root.removeProperty(name);
  }

  if (theme === 'default') return;

  for (const [name, value] of Object.entries(THEME_VARIABLES[theme])) {
    root.setProperty(name, value);
  }
}

/** Clears any level-visual or color-theme overrides, restoring the default palette. */
export function clearThemeVariables(): void {
  const root = document.documentElement.style;
  for (const name of ALL_VARIABLE_NAMES) {
    root.removeProperty(name);
  }
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const SCALE_LIGHTNESS: Record<number, number> = {
  50: 0.96,
  100: 0.91,
  200: 0.82,
  300: 0.7,
  400: 0.58,
};
const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/**
 * Derives a 10-step brand scale (plus app background + noise color) from a
 * single signature hex color, so per-level "story world" visuals (see
 * storyWorlds.ts) don't require hand-authoring a full palette for each of
 * the 10 levels — only one representative color per world.
 */
export function generateScaleFromColor(signatureHex: string): Record<string, string> {
  const { h, s, l } = hexToHsl(signatureHex);
  const vars: Record<string, string> = {};
  for (const step of SCALE_STEPS) {
    const lightness = step <= 400 ? SCALE_LIGHTNESS[step] : Math.max(0.08, l - ((step - 500) / 400) * (l - 0.08));
    vars[`--color-brand-${step}`] = hslToHex(h, Math.min(1, s * 1.05), lightness);
  }
  vars['--app-bg-light'] = hslToHex(h, Math.min(1, s * 0.5), 0.97);
  vars['--app-bg-dark'] = hslToHex(h, Math.min(1, s * 0.6), 0.05);
  const r = parseInt(signatureHex.slice(1, 3), 16);
  const g = parseInt(signatureHex.slice(3, 5), 16);
  const b = parseInt(signatureHex.slice(5, 7), 16);
  vars['--noise-rgb'] = `${r}, ${g}, ${b}`;
  return vars;
}
