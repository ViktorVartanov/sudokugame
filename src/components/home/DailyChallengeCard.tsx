import { Flame, CheckCircle2, Play, Clock } from 'lucide-react';
import { useDailyChallengeStore } from '../../store/useDailyChallengeStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getDailyLevelId, getTodayDateString } from '../../lib/dailyChallenge';
import { getDifficultyLevel } from '../../lib/difficulty';
import { useT } from '../../lib/i18n';
import { formatTime, cn } from '../../lib/utils';

interface DailyChallengeCardProps {
  onPlay: () => void;
}

export function DailyChallengeCard({ onPlay }: DailyChallengeCardProps) {
  const t = useT();
  const language = useSettingsStore((state) => state.language);
  const history = useDailyChallengeStore((state) => state.history);
  const streak = useDailyChallengeStore((state) => state.getStreak());

  const dateString = getTodayDateString();
  const todayRecord = history[dateString];
  const isCompletedToday = !!todayRecord;
  const level = getDifficultyLevel(getDailyLevelId(dateString));

  const formattedDate = new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${dateString}T00:00:00`));

  return (
    // A warm paper-toned card with a thin accent border, not a saturated
    // hero-banner gradient — matches the muted, editorial palette used for
    // the in-game "material" surfaces instead of a generic bright SaaS card.
    <div className="mx-4 mb-6 rounded-[24px] border border-amber-200/70 bg-amber-50/70 p-5 dark:border-amber-500/20 dark:bg-amber-500/5 sm:mx-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700/80 dark:text-amber-400/80">
            <Flame size={14} />
            {t('daily.title')}
          </div>
          <p className="mt-1 font-serif text-xl font-bold capitalize text-slate-900 dark:text-white">{formattedDate}</p>
          <span className="mt-1 inline-block rounded-full border border-amber-300/60 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:text-amber-300">
            {t(`difficulty.${level.key}.name`)}
          </span>
        </div>
        {streak > 0 && (
          <div className="flex shrink-0 flex-col items-center px-1 text-amber-700 dark:text-amber-400">
            <span className="font-serif text-2xl font-bold leading-none">{streak}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700/70 dark:text-amber-400/70">
              {language === 'ru' ? 'дн.' : 'days'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {isCompletedToday ? (
          <>
            <div className="flex items-center gap-1.5 rounded-full border border-amber-300/60 px-3 py-1.5 text-sm font-semibold text-amber-800 dark:border-amber-500/30 dark:text-amber-300">
              <CheckCircle2 size={16} />
              {t('daily.completedBadge')}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Clock size={14} />
              {formatTime(todayRecord.timeSeconds)}
            </div>
            <button
              onClick={onPlay}
              className="ml-auto flex items-center gap-1.5 rounded-full bg-amber-700 px-4 py-2 text-sm font-bold text-white transition-transform active:scale-95 dark:bg-amber-600"
            >
              <Play size={14} /> {t('daily.playAgain')}
            </button>
          </>
        ) : (
          <button
            onClick={onPlay}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-full bg-amber-700 py-3 text-sm font-bold text-white transition-transform active:scale-[0.98] dark:bg-amber-600',
            )}
          >
            <Play size={16} /> {t('daily.play')}
          </button>
        )}
      </div>
    </div>
  );
}
