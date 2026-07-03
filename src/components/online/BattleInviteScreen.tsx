import { Swords, X } from 'lucide-react';
import type { BattleInvitePayload } from '../../types/online';
import { useGameStore } from '../../store/useGameStore';
import { getDifficultyLevel } from '../../lib/difficulty';
import { useT } from '../../lib/i18n';
import { formatTime } from '../../lib/utils';
import { Button } from '../common/Button';

interface BattleInviteScreenProps {
  payload: BattleInvitePayload;
  onDecline: () => void;
  onAccepted: () => void;
}

export function BattleInviteScreen({ payload, onDecline, onAccepted }: BattleInviteScreenProps) {
  const t = useT();
  const startBattleGame = useGameStore((state) => state.startBattleGame);
  const level = getDifficultyLevel(payload.levelId);

  const handleAccept = () => {
    startBattleGame(payload.levelId, payload.seed, {
      creatorUsername: payload.creatorUsername,
      creatorAvatarEmoji: payload.creatorAvatarEmoji,
      creatorResult: payload.creatorResult,
    });
    onAccepted();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-noise px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/60">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-3xl text-white shadow-lg shadow-rose-500/30">
          <Swords size={28} />
        </div>

        <h1 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
          {t('invite.battle.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t('invite.battle.body', { name: payload.creatorUsername })}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-700/30">
          <span className="text-xl">{payload.creatorAvatarEmoji}</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{payload.creatorUsername}</span>
        </div>

        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
          {t('invite.battle.difficulty', { level: t(`difficulty.${level.key}.name`) })}
        </p>

        {payload.creatorResult && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {t('victory.time')}: {formatTime(payload.creatorResult.timeSeconds)}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button
            onClick={onDecline}
            className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X size={16} /> {t('invite.battle.decline')}
          </button>
          <Button variant="primary" onClick={handleAccept} className="h-12">
            <Swords size={16} /> {t('invite.battle.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
