import type { CSSProperties } from 'react';
import { Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { DifficultyLevel, LevelProgress } from '../../types/sudoku';
import { StarRating } from '../common/StarRating';
import { formatTime, cn } from '../../lib/utils';

interface LevelCardProps {
  level: DifficultyLevel;
  progress: LevelProgress;
  hasSavedGame: boolean;
  onPlay: () => void;
  style?: CSSProperties;
}

const DIFFICULTY_TIERS = 5;

function DifficultyMeter({ level }: { level: DifficultyLevel }) {
  const tier = Math.ceil(level.id / 2);

  return (
    <div className="flex items-center gap-1" aria-label={`Difficulty ${tier} of ${DIFFICULTY_TIERS}`}>
      {Array.from({ length: DIFFICULTY_TIERS }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 w-3.5 rounded-full transition-colors',
            i < tier ? cn('bg-gradient-to-r', level.gradient) : 'bg-slate-200 dark:bg-slate-700',
          )}
        />
      ))}
    </div>
  );
}

export function LevelCard({ level, progress, hasSavedGame, onPlay, style }: LevelCardProps) {
  const isCompleted = progress.timesCompleted > 0;

  return (
    <button
      onClick={onPlay}
      style={style}
      className={cn(
        'group relative flex animate-fade-up flex-col overflow-hidden rounded-[28px] bg-white p-5 text-left shadow-sm ring-1 transition-all duration-300 sm:p-6',
        'hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/60 active:translate-y-0 active:scale-[0.98] active:duration-150',
        'dark:bg-slate-800/60 dark:hover:shadow-black/40',
        isCompleted
          ? 'ring-emerald-200/70 dark:ring-emerald-500/20'
          : 'ring-slate-200/80 dark:ring-slate-700/60',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-40',
          level.gradient,
        )}
      />

      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
            level.gradient,
          )}
        >
          {level.id}
        </div>
        {isCompleted && (
          <CheckCircle2
            size={22}
            className="animate-pop text-emerald-500 drop-shadow-sm dark:text-emerald-400"
          />
        )}
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{level.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{level.tagline}</p>

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <DifficultyMeter level={level} />
        <span className="shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {level.clues} givens
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700/60">
        {isCompleted ? (
          <div className="flex flex-col gap-1">
            <StarRating stars={progress.stars} size={14} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Best {formatTime(progress.bestTimeSeconds ?? 0)}
            </span>
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Not solved yet</span>
        )}

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white dark:bg-slate-700/60 dark:text-slate-300">
          {hasSavedGame ? <RotateCcw size={16} /> : <Play size={16} className="ml-0.5" />}
        </span>
      </div>

      {hasSavedGame && (
        <span className="absolute right-4 top-4 animate-pop rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
          Resume
        </span>
      )}
    </button>
  );
}
