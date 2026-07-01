import { ArrowLeft, Trophy, Clock, Target, Star, Flame, CheckCircle2 } from 'lucide-react';
import { DIFFICULTY_LEVELS } from '../../lib/difficulty';
import { useProgressStore } from '../../store/useProgressStore';
import { useAchievementsStore } from '../../store/useAchievementsStore';
import { ACHIEVEMENTS } from '../../lib/achievements';
import { ThemeToggle } from '../layout/ThemeToggle';
import { StarRating } from '../common/StarRating';
import { StatCard } from './StatCard';
import { formatDuration, formatTime, cn } from '../../lib/utils';

interface StatsScreenProps {
  onBack: () => void;
}

export function StatsScreen({ onBack }: StatsScreenProps) {
  const levels = useProgressStore((state) => state.levels);
  const totalWins = useProgressStore((state) => state.totalWins);
  const totalTimePlayedSeconds = useProgressStore((state) => state.totalTimePlayedSeconds);
  const unlockedAchievements = useAchievementsStore((state) => state.unlocked);

  const completedCount = DIFFICULTY_LEVELS.filter((level) => (levels[level.id]?.timesCompleted ?? 0) > 0).length;
  const totalStars = DIFFICULTY_LEVELS.reduce((sum, level) => sum + (levels[level.id]?.stars ?? 0), 0);
  const perfectSolves = DIFFICULTY_LEVELS.filter((level) => (levels[level.id]?.stars ?? 0) === 3).length;
  const achievementCount = ACHIEVEMENTS.filter((a) => unlockedAchievements[a.id]?.unlocked).length;

  return (
    <div className="min-h-screen bg-noise">
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-8">
        <header className="flex items-center justify-between py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Back to levels"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/80"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight text-slate-900 dark:text-white">
                Your Stats
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track your journey to mastery</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Levels Completed"
            value={`${completedCount}/${DIFFICULTY_LEVELS.length}`}
            gradient="from-emerald-400 to-teal-500"
          />
          <StatCard
            icon={<Trophy size={20} />}
            label="Total Wins"
            value={totalWins}
            gradient="from-amber-400 to-orange-500"
            style={{ animationDelay: '40ms' }}
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Time Played"
            value={formatDuration(totalTimePlayedSeconds)}
            gradient="from-sky-400 to-blue-500"
            style={{ animationDelay: '80ms' }}
          />
          <StatCard
            icon={<Star size={20} />}
            label="Stars Earned"
            value={`${totalStars}/30`}
            gradient="from-yellow-400 to-amber-500"
            style={{ animationDelay: '120ms' }}
          />
          <StatCard
            icon={<Target size={20} />}
            label="Perfect Solves"
            value={perfectSolves}
            sublabel="3-star, no mistakes"
            gradient="from-violet-400 to-purple-500"
            style={{ animationDelay: '160ms' }}
          />
          <StatCard
            icon={<Flame size={20} />}
            label="Achievements"
            value={`${achievementCount}/${ACHIEVEMENTS.length}`}
            gradient="from-rose-400 to-pink-500"
            style={{ animationDelay: '200ms' }}
          />
        </section>

        <section className="mt-10">
          <h2 className="mb-5 font-display text-xl font-bold text-slate-900 dark:text-white">
            Level Breakdown
          </h2>
          <div className="flex flex-col gap-2.5 rounded-3xl bg-white p-2.5 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/60">
            {DIFFICULTY_LEVELS.map((level) => {
              const progress = levels[level.id];
              const isCompleted = (progress?.timesCompleted ?? 0) > 0;

              return (
                <div
                  key={level.id}
                  className="flex items-center gap-4 rounded-2xl px-3.5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm',
                      level.gradient,
                    )}
                  >
                    {level.id}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {level.name}
                    </p>
                    {isCompleted ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Solved {progress!.timesCompleted}× · Best {formatTime(progress!.bestTimeSeconds ?? 0)}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500">Not solved yet</p>
                    )}
                  </div>
                  <StarRating stars={progress?.stars ?? 0} size={14} className="shrink-0" />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
