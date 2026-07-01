import type { DifficultyLevel } from '../types/sudoku';

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  {
    id: 1,
    key: 'beginner',
    name: 'Beginner',
    tagline: 'Learn the ropes',
    clues: 50,
    gradient: 'from-emerald-400 to-teal-500',
    ring: 'ring-emerald-400/40',
  },
  {
    id: 2,
    key: 'novice',
    name: 'Novice',
    tagline: 'Building confidence',
    clues: 46,
    gradient: 'from-teal-400 to-cyan-500',
    ring: 'ring-teal-400/40',
  },
  {
    id: 3,
    key: 'easy',
    name: 'Easy',
    tagline: 'A gentle challenge',
    clues: 42,
    gradient: 'from-cyan-400 to-sky-500',
    ring: 'ring-cyan-400/40',
  },
  {
    id: 4,
    key: 'casual',
    name: 'Casual',
    tagline: 'Weekend puzzling',
    clues: 38,
    gradient: 'from-sky-400 to-blue-500',
    ring: 'ring-sky-400/40',
  },
  {
    id: 5,
    key: 'intermediate',
    name: 'Intermediate',
    tagline: 'Sharpen your logic',
    clues: 35,
    gradient: 'from-blue-400 to-indigo-500',
    ring: 'ring-blue-400/40',
  },
  {
    id: 6,
    key: 'advanced',
    name: 'Advanced',
    tagline: 'Serious deduction',
    clues: 32,
    gradient: 'from-indigo-400 to-violet-500',
    ring: 'ring-indigo-400/40',
  },
  {
    id: 7,
    key: 'hard',
    name: 'Hard',
    tagline: 'Tests your patience',
    clues: 30,
    gradient: 'from-violet-400 to-purple-500',
    ring: 'ring-violet-400/40',
  },
  {
    id: 8,
    key: 'expert',
    name: 'Expert',
    tagline: 'Few clues, no mercy',
    clues: 28,
    gradient: 'from-purple-400 to-fuchsia-500',
    ring: 'ring-purple-400/40',
  },
  {
    id: 9,
    key: 'master',
    name: 'Master',
    tagline: 'Elite territory',
    clues: 26,
    gradient: 'from-fuchsia-400 to-rose-500',
    ring: 'ring-fuchsia-400/40',
  },
  {
    id: 10,
    key: 'grandmaster',
    name: 'Grandmaster',
    tagline: 'The ultimate test',
    clues: 24,
    gradient: 'from-rose-500 to-red-600',
    ring: 'ring-rose-500/40',
  },
];

export function getDifficultyLevel(id: number): DifficultyLevel {
  const level = DIFFICULTY_LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown difficulty level id: ${id}`);
  return level;
}
