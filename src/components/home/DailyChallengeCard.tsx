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
    <div className="mx-4 mb-6 overflow-hidden rounded-[24px] bg-gradient-to-br from-orange-500 to-rose-600 p-5 shadow-lg shadow-orange-500/25 sm:mx-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white/80">
            <Flame size={14} />
            {t('daily.title')}
          </div>
          <p className="mt-1 font-display text-lg font-bold capitalize text-white">{formattedDate}</p>
          <span className="mt-1 inline-block rounded-lg bg-white/15 px-2 py-0.5 text-xs font-semibold text-white">
            {t(`difficulty.${level.key}.name`)}
          </span>
        </div>
        {streak > 0 && (
          <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/15 px-3 py-2 text-white">
            <span className="font-display text-lg font-extrabold leading-none">{streak}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
              {language === 'ru' ? 'дн.' : 'days'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {isCompletedToday ? (
          <>
            <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white">
              <CheckCircle2 size={16} />
              {t('daily.completedBadge')}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/90">
              <Clock size={14} />
              {formatTime(todayRecord.timeSeconds)}
            </div>
            <button
              onClick={onPlay}
              className="ml-auto flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-sm transition-transform active:scale-95"
            >
              <Play size={14} /> {t('daily.playAgain')}
            </button>
          </>
        ) : (
          <button
            onClick={onPlay}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-orange-600 shadow-sm transition-transform active:scale-[0.98]',
            )}
          >
            <Play size={16} /> {t('daily.play')}
          </button>
        )}
      </div>
    </div>
  );
}
