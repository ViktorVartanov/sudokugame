import { ArrowLeft, Pause, Play, RotateCcw, Timer, AlertTriangle, Flame } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getDifficultyLevel } from '../../lib/difficulty';
import { getStoryWorld } from '../../lib/storyWorlds';
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
  const world = getStoryWorld(levelId);

  return (
    <div className="premium-game-header mx-auto flex w-full max-w-[min(92vw,32rem)] items-center justify-between py-3 sm:py-4">
      <button
        onClick={onBack}
        className="header-icon-button flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
        aria-label={t('gameHeader.back')}
      >
        <ArrowLeft size={20} />
      </button>

      <div className="header-center-panel min-w-0 flex-1 px-3 text-center">
        {/* Not `truncate`: several world names ("Тихая библиотека",
            "Горная обсерватория", "Космическая станция"...) got cut off
            with an ellipsis in this narrow header column — a couple of
            characters is not enough to identify the world. Letting it wrap
            up to two lines (with a smaller base size so a two-line title
            doesn't blow out the header's height too much) shows the full
            name instead. */}
        <h1 className="world-title line-clamp-2 font-display text-xl font-bold leading-tight sm:text-2xl">
          {t(`story.${world.key}.title`)}
        </h1>
        {isDailyChallenge ? (
          <span className="world-subtitle mt-0.5 inline-flex items-center gap-1 text-sm font-bold">
            <Flame size={13} /> {t('daily.badge')}
          </span>
        ) : (
          <span className={cn('world-subtitle mt-0.5 inline-flex items-center gap-2 text-sm font-semibold')}>
            <span aria-hidden="true">{world.icon}</span>
            {t(`difficulty.${level.key}.name`)}
            <span className="opacity-45">•</span>
            <span>{t('level.number', { level: levelId })}</span>
          </span>
        )}
        <div className="world-meta mt-2 flex items-center justify-center gap-3 text-xs font-medium">
          {showTimer && (
            <span className="timer-pill flex items-center gap-1">
              <Timer size={13} /> {formatTime(elapsedSeconds)}
            </span>
          )}
          <span className={cn('mistake-pill flex items-center gap-1', mistakes > 0 && 'has-mistakes')}>
            <AlertTriangle size={13} /> {mistakes}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={restartPuzzle}
          disabled={isComplete}
          aria-label={t('gameHeader.restart')}
          className="header-icon-button flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200/60 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700/60"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={togglePause}
          disabled={isComplete}
          aria-label={isPaused ? t('gameHeader.resume') : t('gameHeader.pause')}
          className="header-icon-button flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-200/60 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-700/60"
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>
    </div>
  );
}
