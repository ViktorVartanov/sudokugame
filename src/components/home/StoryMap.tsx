import { Trophy, Lock, CheckCircle2, RotateCcw, Play } from 'lucide-react';
import { DIFFICULTY_LEVELS, getDifficultyLevel } from '../../lib/difficulty';
import { STORY_WORLDS, isLevelUnlocked } from '../../lib/storyWorlds';
import { useProgressStore } from '../../store/useProgressStore';
import { useGameStore } from '../../store/useGameStore';
import { useT } from '../../lib/i18n';
import { formatTime, cn } from '../../lib/utils';

interface StoryMapProps {
  onSelectLevel: (levelId: number) => void;
}

export function StoryMap({ onSelectLevel }: StoryMapProps) {
  const levels = useProgressStore((state) => state.levels);
  const savedLevelId = useGameStore((state) => state.getSavedLevelId());
  const t = useT();

  const completedCount = DIFFICULTY_LEVELS.filter((level) => (levels[level.id]?.timesCompleted ?? 0) > 0).length;
  const totalStars = DIFFICULTY_LEVELS.reduce((sum, level) => sum + (levels[level.id]?.stars ?? 0), 0);
  const progressPct = (completedCount / DIFFICULTY_LEVELS.length) * 100;

  return (
    <section className="px-4 pb-10 sm:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t('story.title')}</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t('story.subtitle')}</p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/60">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{t('level.progress')}</span>
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

      <div className="relative flex flex-col gap-3">
        {STORY_WORLDS.map((world, index) => {
          const level = getDifficultyLevel(world.levelId);
          const progress = levels[world.levelId];
          const isCompleted = (progress?.timesCompleted ?? 0) > 0;
          const unlocked = isLevelUnlocked(world.levelId, levels);
          const hasSavedGame = savedLevelId === world.levelId;
          const isLast = index === STORY_WORLDS.length - 1;
          const previousWorld = index > 0 ? STORY_WORLDS[index - 1] : null;

          return (
            <div
              key={world.levelId}
              className="relative flex animate-fade-up gap-3.5 sm:gap-4"
              style={{ animationDelay: `${index * 45}ms`, animationFillMode: 'backwards' }}
            >
              {!isLast && (
                <div className="absolute left-[27px] top-14 h-[calc(100%-2rem)] w-0.5 bg-slate-200 dark:bg-slate-700 sm:left-[31px]" />
              )}

              <div
                className={cn(
                  'story-world-node relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-lg sm:h-16 sm:w-16',
                  world.gradient,
                  world.glow,
                  !unlocked && 'grayscale opacity-50 shadow-none',
                )}
              >
                {!unlocked ? <Lock size={20} /> : isCompleted ? <CheckCircle2 size={24} /> : world.levelId}
              </div>

              <button
                data-world={world.key}
                onClick={() => unlocked && onSelectLevel(world.levelId)}
                disabled={!unlocked}
                className={cn(
                  'story-world-card group flex flex-1 flex-col rounded-[24px] bg-white p-4 text-left shadow-sm ring-1 transition-all duration-300 sm:p-5',
                  unlocked && 'hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-[0.99]',
                  isCompleted ? 'ring-emerald-200/70 dark:ring-emerald-500/20' : 'ring-slate-200/80 dark:ring-slate-700/60',
                  'dark:bg-slate-800/60',
                  !unlocked && 'opacity-60',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                      {t(`story.${world.key}.title`)}
                    </h3>
                    <span
                      className={cn(
                        'bg-gradient-to-r bg-clip-text text-xs font-semibold text-transparent',
                        level.gradient,
                      )}
                    >
                      {t(`difficulty.${level.key}.name`)}
                    </span>
                  </div>
                  {unlocked && (
                    <span className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 transition-colors group-hover:bg-brand-500 group-hover:text-white dark:bg-slate-700/60 dark:text-slate-300">
                      {hasSavedGame ? <RotateCcw size={13} /> : <Play size={13} />}
                      {hasSavedGame ? t('level.resume') : t('story.play')}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  {t(`story.${world.key}.description`)}
                </p>

                {isCompleted && (
                  <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {t('story.completed')} · {t('level.best', { time: formatTime(progress?.bestTimeSeconds ?? 0) })}
                  </p>
                )}

                {!unlocked && previousWorld && (
                  <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                    {t('story.locked', { level: t(`story.${previousWorld.key}.title`) })}
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
