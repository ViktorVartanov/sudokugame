import { useEffect } from 'react';
import { Trophy, Sparkles, Zap, Crown, Medal, Flame, Clock, AlertTriangle, type LucideIcon } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { getDifficultyLevel, DIFFICULTY_LEVELS } from '../../lib/difficulty';
import { ACHIEVEMENTS } from '../../lib/achievements';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StarRating } from '../common/StarRating';
import { formatTime, cn } from '../../lib/utils';
import { celebrateWin } from '../../lib/confetti';

const ICONS: Record<string, LucideIcon> = { Trophy, Sparkles, Zap, Crown, Medal, Flame };

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

  useEffect(() => {
    if (isComplete) celebrateWin();
  }, [isComplete]);

  if (!isComplete || levelId === null || !completion) return null;

  const level = getDifficultyLevel(levelId);
  const hasNextLevel = levelId < DIFFICULTY_LEVELS.length;

  return (
    <Modal open={isComplete}>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg shadow-orange-500/40 animate-pop">
          <Trophy size={38} className="text-white" />
        </div>

        <h2 className="mt-4 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
          Puzzle Solved!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You conquered <span className="font-semibold">{level.name}</span>
        </p>

        <StarRating stars={completion.stars} size={28} className="mt-4" />

        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/70">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock size={14} />
              <span className="text-xs font-medium">Time</span>
            </div>
            <p className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
              {formatTime(elapsedSeconds)}
            </p>
            {completion.isNewBestTime && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-accent-600 dark:text-accent-400">
                New best!
              </span>
            )}
          </div>
          <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/70">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
              <AlertTriangle size={14} />
              <span className="text-xs font-medium">Mistakes</span>
            </div>
            <p className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">{mistakes}</p>
          </div>
        </div>

        {completion.newAchievements.length > 0 && (
          <div className="mt-5 w-full">
            <p className="mb-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
              Achievement{completion.newAchievements.length > 1 ? 's' : ''} unlocked
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
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{achievement.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{achievement.description}</p>
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
              Next Level
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onPlayAgain}>
              Play Again
            </Button>
            <Button variant="secondary" onClick={onBack}>
              All Levels
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
