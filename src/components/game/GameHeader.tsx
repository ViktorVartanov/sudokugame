import { ArrowLeft, Pause, Play, RotateCcw, Timer, AlertTriangle, Flame } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getDifficultyLevel } from '../../lib/difficulty';
import { useT } from '../../lib/i18n';
import { formatTime, cn } from '../../lib/utils';

interface GameHeaderProps {
  onBack: () => void;
}

export function GameHeader({ onBack }: GameHeaderProps) {
  const levelId = useGameStore((state) => state.levelId);
  const isDailyChallenge = useGameStore((state) => state.isDailyChallenge);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const mistakes = useGameStore((state) => state.mistakes);
  const isPaused = useGameStore((state) => state.isPaused);
  const isComplete = useGameStore((state) => state.isComplete);
  const togglePause = useGameStore((state) => state.togglePause);
  const restartPuzzle = useGameStore((state) => state.restartPuzzle);
  const showTimer = useSettingsStore((state) => state.showTimer);
  const t = useT();

  if (levelId === null) return null;
  const level = getDifficultyLevel(levelId);

  return (
    <div className="mx-auto flex w-full max-w-[min(92vw,32rem)] items-center justify-between py-4">
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
        aria-label={t('gameHeader.back')}
      >
        <ArrowLeft size={20} />
      </button>

      <div className="flex flex-col items-center">
        {isDailyChallenge ? (
          <span className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-sm font-bold text-transparent">
            <Flame size={13} className="text-orange-500" /> {t('daily.badge')}
          </span>
        ) : (
          <span
            className={cn(
              'bg-gradient-to-r bg-clip-text text-sm font-bold text-transparent',
              level.gradient,
            )}
          >
            {t(`difficulty.${level.key}.name`)}
          </span>
        )}
        <div className="mt-0.5 flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          {showTimer && (
            <span className="flex items-center gap-1">
              <Timer size={13} /> {formatTime(elapsedSeconds)}
            </span>
          )}
          <span className={cn('flex items-center gap-1', mistakes > 0 && 'text-rose-500')}>
            <AlertTriangle size={13} /> {mistakes}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={restartPuzzle}
          disabled={isComplete}
          aria-label={t('gameHeader.restart')}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200/60 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700/60"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={togglePause}
          disabled={isComplete}
          aria-label={isPaused ? t('gameHeader.resume') : t('gameHeader.pause')}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200/60 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700/60"
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>
    </div>
  );
}
