import { ArrowLeft, Pause, Play, RotateCcw, Timer, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { getDifficultyLevel } from '../../lib/difficulty';
import { formatTime, cn } from '../../lib/utils';

interface GameHeaderProps {
  onBack: () => void;
}

export function GameHeader({ onBack }: GameHeaderProps) {
  const levelId = useGameStore((state) => state.levelId);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const mistakes = useGameStore((state) => state.mistakes);
  const isPaused = useGameStore((state) => state.isPaused);
  const isComplete = useGameStore((state) => state.isComplete);
  const togglePause = useGameStore((state) => state.togglePause);
  const restartPuzzle = useGameStore((state) => state.restartPuzzle);

  if (levelId === null) return null;
  const level = getDifficultyLevel(levelId);

  return (
    <div className="mx-auto flex w-full max-w-[min(92vw,32rem)] items-center justify-between py-4">
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
        aria-label="Back to levels"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="flex flex-col items-center">
        <span
          className={cn(
            'bg-gradient-to-r bg-clip-text text-sm font-bold text-transparent',
            level.gradient,
          )}
        >
          {level.name}
        </span>
        <div className="mt-0.5 flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Timer size={13} /> {formatTime(elapsedSeconds)}
          </span>
          <span className={cn('flex items-center gap-1', mistakes > 0 && 'text-rose-500')}>
            <AlertTriangle size={13} /> {mistakes}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={restartPuzzle}
          disabled={isComplete}
          aria-label="Restart puzzle"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200/60 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700/60"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={togglePause}
          disabled={isComplete}
          aria-label={isPaused ? 'Resume' : 'Pause'}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200/60 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700/60"
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>
    </div>
  );
}
