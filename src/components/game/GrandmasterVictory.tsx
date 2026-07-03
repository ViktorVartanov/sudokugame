import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Crown, Clock, AlertTriangle, Sparkles, Trophy, Sparkle, Share2 } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useAchievementsStore } from '../../store/useAchievementsStore';
import { DIFFICULTY_LEVELS } from '../../lib/difficulty';
import { ACHIEVEMENTS } from '../../lib/achievements';
import { StarRating } from '../common/StarRating';
import { useT } from '../../lib/i18n';
import { useShareResult } from '../../hooks/useShareResult';
import { formatTime, formatDuration } from '../../lib/utils';
import { celebrateGrandmaster } from '../../lib/confetti';

interface GrandmasterVictoryProps {
  onBack: () => void;
  onPlayAgain: () => void;
  onViewStats: () => void;
}

export function GrandmasterVictory({ onBack, onPlayAgain, onViewStats }: GrandmasterVictoryProps) {
  const levelId = useGameStore((state) => state.levelId);
  const isComplete = useGameStore((state) => state.isComplete);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const mistakes = useGameStore((state) => state.mistakes);
  const completion = useGameStore((state) => state.completion);
  const t = useT();
  const { share, label: shareLabel } = useShareResult();

  const levels = useProgressStore((state) => state.levels);
  const totalTimePlayedSeconds = useProgressStore((state) => state.totalTimePlayedSeconds);
  const unlockedAchievements = useAchievementsStore((state) => state.unlocked);

  const isGrandmasterWin = isComplete && levelId === 10 && !!completion;

  useEffect(() => {
    if (isGrandmasterWin) celebrateGrandmaster();
  }, [isGrandmasterWin]);

  if (!isComplete || levelId !== 10 || !completion) return null;

  const totalStars = DIFFICULTY_LEVELS.reduce((sum, level) => sum + (levels[level.id]?.stars ?? 0), 0);
  const achievementCount = ACHIEVEMENTS.filter((a) => unlockedAchievements[a.id]?.unlocked).length;

  const handleShare = () => {
    share(
      t('share.templateGrandmaster', {
        time: formatTime(elapsedSeconds),
        mistakes,
        totalStars,
      }),
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center overflow-y-auto bg-[#0b0518] p-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-20" />

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-amber-400/40" />
          <div className="flex h-20 w-20 animate-float animate-glow items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500">
            <Crown size={36} className="text-white" strokeWidth={2.2} />
          </div>
        </div>

        <h2 className="mt-6 animate-gradient-x bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300 bg-gradient-size-200 bg-clip-text font-display text-4xl font-extrabold text-transparent">
          {t('grandmaster.title')}
        </h2>
        <p className="mt-2 text-sm font-medium text-amber-100/70">{t('grandmaster.subtitle')}</p>

        <StarRating stars={completion.stars} size={30} className="mt-6" />

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="flex items-center justify-center gap-1.5 text-amber-200/70">
              <Clock size={14} />
              <span className="text-xs font-medium">{t('victory.time')}</span>
            </div>
            <p className="mt-1 font-display text-lg font-bold text-white">{formatTime(elapsedSeconds)}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="flex items-center justify-center gap-1.5 text-amber-200/70">
              <AlertTriangle size={14} />
              <span className="text-xs font-medium">{t('victory.mistakes')}</span>
            </div>
            <p className="mt-1 font-display text-lg font-bold text-white">{mistakes}</p>
          </div>
        </div>

        <div className="mt-4 w-full rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <p className="mb-3 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-200/60">
            <Sparkle size={13} /> {t('grandmaster.journey')}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-display text-xl font-bold text-white">{totalStars}/30</p>
              <p className="text-[11px] text-amber-100/60">{t('grandmaster.stars')}</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">{formatDuration(totalTimePlayedSeconds)}</p>
              <p className="text-[11px] text-amber-100/60">{t('grandmaster.played')}</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">
                {achievementCount}/{ACHIEVEMENTS.length}
              </p>
              <p className="text-[11px] text-amber-100/60">{t('grandmaster.achievements')}</p>
            </div>
          </div>
        </div>

        {completion.newAchievements.length > 0 && (
          <div className="mt-4 w-full">
            <div className="flex flex-col gap-2">
              {completion.newAchievements.map((id) => {
                const achievement = ACHIEVEMENTS.find((a) => a.id === id);
                if (!achievement) return null;
                return (
                  <div
                    key={id}
                    className="flex animate-fade-up items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400/10 to-orange-500/10 p-3 text-left ring-1 ring-amber-400/20"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t(`achievement.${achievement.id}.title`)}</p>
                      <p className="text-xs text-amber-100/60">{t(`achievement.${achievement.id}.description`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-7 grid w-full gap-2">
          <button
            onClick={onPlayAgain}
            className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-base font-semibold text-white shadow-lg shadow-amber-600/30 transition-all duration-200 hover:brightness-110 hover:shadow-amber-600/50 active:scale-95"
          >
            <Sparkles size={18} /> {t('grandmaster.solveAnother')}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-semibold text-white ring-1 ring-white/10 transition-all duration-200 hover:bg-white/15 active:scale-95"
          >
            <Share2 size={16} /> {shareLabel}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewStats}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white ring-1 ring-white/10 transition-all duration-200 hover:bg-white/15 active:scale-95"
            >
              {t('grandmaster.viewStats')}
            </button>
            <button
              onClick={onBack}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white ring-1 ring-white/10 transition-all duration-200 hover:bg-white/15 active:scale-95"
            >
              {t('grandmaster.allLevels')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
