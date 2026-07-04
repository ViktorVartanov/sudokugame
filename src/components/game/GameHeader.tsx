import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  Timer,
  AlertTriangle,
  Flame,
  Star,
  Coffee,
  BookOpen,
  CloudRain,
  Flower2,
  Waves,
  Building2,
  Zap,
  Mountain,
  Rocket,
  Crown,
  type LucideIcon,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getDifficultyLevel } from '../../lib/difficulty';
import { getStoryWorld } from '../../lib/storyWorlds';
import { useT } from '../../lib/i18n';
import { formatTime, calculateStars, countTotalCorrectlyPlaced, cn } from '../../lib/utils';

const WORLD_ICONS: Record<string, LucideIcon> = {
  Coffee,
  BookOpen,
  CloudRain,
  Flower2,
  Waves,
  Building2,
  Zap,
  Mountain,
  Rocket,
  Crown,
};

const TOTAL_CELLS = 81;

interface GameHeaderProps {
  onBack: () => void;
}

export function GameHeader({ onBack }: GameHeaderProps) {
  const levelId = useGameStore((state) => state.levelId);
  const isDailyChallenge = useGameStore((state) => state.isDailyChallenge);
  const board = useGameStore((state) => state.board);
  const solution = useGameStore((state) => state.solution);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const mistakes = useGameStore((state) => state.mistakes);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
  const isPaused = useGameStore((state) => state.isPaused);
  const isComplete = useGameStore((state) => state.isComplete);
  const togglePause = useGameStore((state) => state.togglePause);
  const restartPuzzle = useGameStore((state) => state.restartPuzzle);
  const showTimer = useSettingsStore((state) => state.showTimer);
  const useLevelVisual = useSettingsStore((state) => state.useLevelVisual);
  const t = useT();

  if (levelId === null) return null;
  const level = getDifficultyLevel(levelId);
  const world = getStoryWorld(levelId);
  const WorldIcon = useLevelVisual ? WORLD_ICONS[world.victoryIcon] : null;

  const progressPct = Math.round((countTotalCorrectlyPlaced(board, solution) / TOTAL_CELLS) * 100);
  const projectedStars = calculateStars({ mistakes, hintsUsed });

  return (
    <div className="mx-auto w-full max-w-[min(92vw,32rem)] py-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/60"
          aria-label={t('gameHeader.back')}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="font-serif text-lg font-bold leading-tight text-slate-900 dark:text-white sm:text-xl">
            {isDailyChallenge ? t('daily.badge') : t(`story.${world.key}.title`)}
          </h1>
          <span className="mt-0.5 flex items-center gap-1 text-xs font-semibold">
            {isDailyChallenge ? (
              <>
                <Flame size={12} className="text-orange-500" />
                <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                  {t(`difficulty.${level.key}.name`)}
                </span>
              </>
            ) : (
              <>
                {WorldIcon && <WorldIcon size={12} className="text-slate-400 dark:text-slate-500" />}
                <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', level.gradient)}>
                  {t(`difficulty.${level.key}.name`)}
                </span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={restartPuzzle}
            disabled={isComplete}
            aria-label={t('gameHeader.restart')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/60"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={togglePause}
            disabled={isComplete}
            aria-label={isPaused ? t('gameHeader.resume') : t('gameHeader.pause')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 shadow-sm ring-1 ring-slate-200/70 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/60"
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        {showTimer && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Timer size={13} /> {formatTime(elapsedSeconds)}
          </span>
        )}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out', level.gradient)}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{progressPct}%</span>
        <div className="flex shrink-0 items-center gap-0.5" aria-label={t('gameHeader.projectedStars')}>
          {Array.from({ length: 3 }, (_, i) => (
            <Star
              key={i}
              size={12}
              className={i < projectedStars ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300 dark:text-slate-600'}
            />
          ))}
        </div>
        <span className={cn('flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400', mistakes > 0 && 'text-rose-500 dark:text-rose-400')}>
          <AlertTriangle size={13} /> {mistakes}
        </span>
      </div>
    </div>
  );
}
