import { Trophy, Sparkles, Zap, Crown, Medal, Flame, Lock, type LucideIcon } from 'lucide-react';
import { ACHIEVEMENTS } from '../../lib/achievements';
import { useAchievementsStore } from '../../store/useAchievementsStore';
import { useT } from '../../lib/i18n';
import { cn } from '../../lib/utils';

const ICONS: Record<string, LucideIcon> = {
  Trophy,
  Sparkles,
  Zap,
  Crown,
  Medal,
  Flame,
};

export function AchievementsPanel() {
  const unlocked = useAchievementsStore((state) => state.unlocked);
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlocked[a.id]?.unlocked).length;
  const t = useT();

  return (
    <section className="px-4 pb-12 sm:px-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t('achievements.title')}</h2>
        <span className="text-sm font-medium text-slate-400">
          {unlockedCount} / {ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {ACHIEVEMENTS.map((achievement, index) => {
          const isUnlocked = unlocked[achievement.id]?.unlocked ?? false;
          const Icon = ICONS[achievement.icon] ?? Trophy;

          return (
            <div
              key={achievement.id}
              title={t(`achievement.${achievement.id}.description`)}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              className={cn(
                'flex animate-fade-up flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1',
                isUnlocked
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200 hover:shadow-lg hover:shadow-amber-500/10 dark:from-amber-500/10 dark:to-orange-500/10 dark:ring-amber-400/20'
                  : 'bg-slate-100/70 ring-1 ring-slate-200/60 dark:bg-slate-800/40 dark:ring-slate-700/40',
              )}
            >
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300',
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500',
                )}
              >
                {isUnlocked ? <Icon size={20} /> : <Lock size={18} />}
              </div>
              <p
                className={cn(
                  'text-xs font-semibold leading-tight',
                  isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500',
                )}
              >
                {t(`achievement.${achievement.id}.title`)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
