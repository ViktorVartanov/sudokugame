import { useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Zap,
  Crown,
  Medal,
  Flame,
  Clock,
  AlertTriangle,
  Share2,
  Swords,
  Coffee,
  BookOpen,
  CloudRain,
  Flower2,
  Waves,
  Building2,
  Mountain,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getDifficultyLevel, DIFFICULTY_LEVELS } from '../../lib/difficulty';
import { getStoryWorld } from '../../lib/storyWorlds';
import { ACHIEVEMENTS } from '../../lib/achievements';
import { buildResultUrl } from '../../lib/deepLinks';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StarRating } from '../common/StarRating';
import { useT } from '../../lib/i18n';
import { useShareResult } from '../../hooks/useShareResult';
import { formatTime, cn } from '../../lib/utils';
import { celebrateWin } from '../../lib/confetti';

const ICONS: Record<string, LucideIcon> = { Trophy, Sparkles, Zap, Crown, Medal, Flame };
const WORLD_ICONS: Record<string, LucideIcon> = {
  Coffee,
  BookOpen,
  CloudRain,
  Flower2,
  Waves,
  Building2,
  Zap,
  Mountain,
  Rocket,
  Crown,
};

interface VictoryModalProps {
  onBack: () => void;
  onPlayAgain: () => void;
  onNextLevel: () => void;
}

export function VictoryModal({ onBack, onPlayAgain, onNextLevel }: VictoryModalProps) {
  const levelId = useGameStore((state) => state.levelId);
  const isComplete = useGameStore((state) => state.isComplete);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const mistakes = useGameStore((state) => state.mistakes);
  const completion = useGameStore((state) => state.completion);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
  const activeBattleContext = useGameStore((state) => state.activeBattleContext);
  const currentSeed = useGameStore((state) => state.currentSeed);
  const useLevelVisual = useSettingsStore((state) => state.useLevelVisual);
  const nickname = useSettingsStore((state) => state.nickname);
  const avatarEmoji = useSettingsStore((state) => state.avatarEmoji);
  const t = useT();
  const { share, label: shareLabel } = useShareResult();

  useEffect(() => {
    if (isComplete) celebrateWin();
  }, [isComplete]);

  if (!isComplete || levelId === null || !completion) return null;

  const level = getDifficultyLevel(levelId);
  const world = getStoryWorld(levelId);
  const hasNextLevel = levelId < DIFFICULTY_LEVELS.length;
  const VictoryIcon = useLevelVisual ? (WORLD_ICONS[world.victoryIcon] ?? Trophy) : Trophy;

  const handleShare = () => {
    const resultUrl = buildResultUrl({
      username: nickname.trim() || 'Player',
      avatarEmoji,
      levelId,
      timeSeconds: elapsedSeconds,
      mistakes,
      hintsUsed,
      stars: completion.stars,
      seed: currentSeed,
      completedAt: Date.now(),
    });
    share(resultUrl);
  };

  return (
    <Modal open={isComplete}>
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-lg animate-pop',
            useLevelVisual ? world.gradient : 'from-amber-300 to-orange-500',
            useLevelVisual ? world.glow : 'shadow-orange-500/40',
          )}
        >
          <VictoryIcon size={38} className="text-white" />
        </div>

        <h2 className="mt-4 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
          {t('victory.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('victory.conquered', { level: t(`difficulty.${level.key}.name`) })}
        </p>

        <StarRating stars={completion.stars} size={28} className="mt-4" />

        {activeBattleContext?.creatorResult && (
          <div className="mt-4 w-full rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-4 text-left ring-1 ring-rose-200/70 dark:from-rose-500/10 dark:to-orange-500/10 dark:ring-rose-500/20">
            <div className="flex items-center gap-2">
              <Swords size={16} className="text-rose-500" />
              <p className="font-display text-sm font-bold text-slate-800 dark:text-slate-100">
                {elapsedSeconds < activeBattleContext.creatorResult.timeSeconds
                  ? t('battle.youWon', { name: activeBattleContext.creatorUsername })
                  : elapsedSeconds > activeBattleContext.creatorResult.timeSeconds
                    ? t('battle.youLost', {
                        name: activeBattleContext.creatorUsername,
                        diff: formatTime(elapsedSeconds - activeBattleContext.creatorResult.timeSeconds),
                      })
                    : t('battle.tie', { name: activeBattleContext.creatorUsername })}
              </p>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t('battle.yourTime')}: {formatTime(elapsedSeconds)}</span>
              <span>
                {t('battle.opponentTime', { name: activeBattleContext.creatorUsername })}:{' '}
                {formatTime(activeBattleContext.creatorResult.timeSeconds)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/70">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock size={14} />
              <span className="text-xs font-medium">{t('victory.time')}</span>
            </div>
            <p className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
              {formatTime(elapsedSeconds)}
            </p>
            {completion.isNewBestTime && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-accent-600 dark:text-accent-400">
                {t('victory.newBest')}
              </span>
            )}
          </div>
          <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/70">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
              <AlertTriangle size={14} />
              <span className="text-xs font-medium">{t('victory.mistakes')}</span>
            </div>
            <p className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">{mistakes}</p>
          </div>
        </div>

        {completion.newAchievements.length > 0 && (
          <div className="mt-5 w-full">
            <p className="mb-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
              {completion.newAchievements.length > 1 ? t('victory.achievementsUnlocked') : t('victory.achievementUnlocked')}
            </p>
            <div className="flex flex-col gap-2">
              {completion.newAchievements.map((id) => {
                const achievement = ACHIEVEMENTS.find((a) => a.id === id);
                if (!achievement) return null;
                const Icon = ICONS[achievement.icon] ?? Trophy;
                return (
                  <div
                    key={id}
                    className="flex animate-fade-up items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-3 text-left ring-1 ring-amber-200 dark:from-amber-500/10 dark:to-orange-500/10 dark:ring-amber-400/20"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {t(`achievement.${achievement.id}.title`)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t(`achievement.${achievement.id}.description`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={cn('mt-6 grid w-full gap-2', hasNextLevel ? 'grid-cols-1' : 'grid-cols-1')}>
          {hasNextLevel && (
            <Button variant="primary" size="lg" onClick={onNextLevel} className="w-full">
              {t('victory.nextLevel')}
            </Button>
          )}
          <Button variant="ghost" onClick={handleShare} className="w-full">
            <Share2 size={16} /> {shareLabel}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onPlayAgain}>
              {t('victory.playAgain')}
            </Button>
            <Button variant="secondary" onClick={onBack}>
              {t('victory.allLevels')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
