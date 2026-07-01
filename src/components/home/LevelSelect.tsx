import { Trophy } from 'lucide-react';
import { DIFFICULTY_LEVELS } from '../../lib/difficulty';
import { useProgressStore } from '../../store/useProgressStore';
import { useGameStore } from '../../store/useGameStore';
import { LevelCard } from './LevelCard';

interface LevelSelectProps {
  onSelectLevel: (levelId: number) => void;
}

export function LevelSelect({ onSelectLevel }: LevelSelectProps) {
  const levels = useProgressStore((state) => state.levels);
  const savedLevelId = useGameStore((state) => state.getSavedLevelId());

  const completedCount = DIFFICULTY_LEVELS.filter((level) => (levels[level.id]?.timesCompleted ?? 0) > 0).length;
  const totalStars = DIFFICULTY_LEVELS.reduce((sum, level) => sum + (levels[level.id]?.stars ?? 0), 0);
  const progressPct = (completedCount / DIFFICULTY_LEVELS.length) * 100;

  return (
    <section className="px-4 pb-10 sm:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Choose your level</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Ten difficulties, each with a freshly generated puzzle.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/60">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Progress</span>
              <span className="text-slate-700 dark:text-slate-200">
                {completedCount}/{DIFFICULTY_LEVELS.length}
              </span>
            </div>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-100 pl-4 text-sm font-bold text-amber-500 dark:border-slate-700">
            <Trophy size={16} className="fill-amber-400 text-amber-500" />
            {totalStars}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
        {DIFFICULTY_LEVELS.map((level, index) => (
          <LevelCard
            key={level.id}
            level={level}
            progress={levels[level.id] ?? { bestTimeSeconds: null, bestMistakes: null, timesCompleted: 0, stars: 0 }}
            hasSavedGame={savedLevelId === level.id}
            onPlay={() => onSelectLevel(level.id)}
            style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'backwards' }}
          />
        ))}
      </div>
    </section>
  );
}
