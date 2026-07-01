import type { AchievementDefinition, AchievementsMap } from '../types/sudoku';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Complete your very first puzzle.',
    icon: 'Trophy',
  },
  {
    id: 'flawless',
    title: 'Flawless Victory',
    description: 'Finish a puzzle with zero mistakes and zero hints.',
    icon: 'Sparkles',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Solve any puzzle in under 3 minutes.',
    icon: 'Zap',
  },
  {
    id: 'grandmaster_slayer',
    title: 'Grandmaster Slayer',
    description: 'Defeat a Grandmaster difficulty puzzle.',
    icon: 'Crown',
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Win at least one puzzle on all 10 difficulty levels.',
    icon: 'Medal',
  },
  {
    id: 'dedicated',
    title: 'Dedicated Solver',
    description: 'Complete 25 puzzles in total.',
    icon: 'Flame',
  },
];

export function createEmptyAchievementsMap(): AchievementsMap {
  const map: AchievementsMap = {};
  for (const achievement of ACHIEVEMENTS) {
    map[achievement.id] = { unlocked: false, unlockedAt: null };
  }
  return map;
}

export interface AchievementContext {
  levelId: number;
  isGrandmaster: boolean;
  elapsedSeconds: number;
  mistakes: number;
  hintsUsed: number;
  isFirstWinEver: boolean;
  allLevelsCompleted: boolean;
  totalWinsAfterThis: number;
}

/** Pure evaluation of which *new* achievements should unlock given a win context. */
export function evaluateNewAchievements(
  ctx: AchievementContext,
  current: AchievementsMap,
): string[] {
  const unlocked: string[] = [];
  const isLocked = (id: string) => !current[id]?.unlocked;

  if (isLocked('first_win') && ctx.isFirstWinEver) {
    unlocked.push('first_win');
  }
  if (isLocked('flawless') && ctx.mistakes === 0 && ctx.hintsUsed === 0) {
    unlocked.push('flawless');
  }
  if (isLocked('speed_demon') && ctx.elapsedSeconds < 180) {
    unlocked.push('speed_demon');
  }
  if (isLocked('grandmaster_slayer') && ctx.isGrandmaster) {
    unlocked.push('grandmaster_slayer');
  }
  if (isLocked('completionist') && ctx.allLevelsCompleted) {
    unlocked.push('completionist');
  }
  if (isLocked('dedicated') && ctx.totalWinsAfterThis >= 25) {
    unlocked.push('dedicated');
  }

  return unlocked;
}
