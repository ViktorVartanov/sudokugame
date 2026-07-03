import { useState } from 'react';
import { Flame, Swords, Share2, Download, Link2, Check, Home } from 'lucide-react';
import type { ResultPayload } from '../../types/online';
import { useGameStore } from '../../store/useGameStore';
import { getDifficultyLevel } from '../../lib/difficulty';
import { getStoryWorld, getWorldHexGradient } from '../../lib/storyWorlds';
import { buildBattleInviteUrl, buildResultUrl } from '../../lib/deepLinks';
import { generateShareCard } from '../../lib/shareCard';
import { shareText } from '../../lib/share';
import { useT } from '../../lib/i18n';
import { StarRating } from '../common/StarRating';
import { Button } from '../common/Button';
import { formatTime } from '../../lib/utils';

interface ResultScreenProps {
  payload: ResultPayload;
  onGoHome: () => void;
  onStartGame: () => void;
}

export function ResultScreen({ payload, onGoHome, onStartGame }: ResultScreenProps) {
  const t = useT();
  const startBattleGame = useGameStore((state) => state.startBattleGame);
  const [status, setStatus] = useState<'idle' | 'linkCopied' | 'imageSaved'>('idle');
  const [generatingImage, setGeneratingImage] = useState(false);

  const level = getDifficultyLevel(payload.levelId);
  const world = getStoryWorld(payload.levelId);
  const resultUrl = buildResultUrl(payload);

  const flashStatus = (next: 'linkCopied' | 'imageSaved') => {
    setStatus(next);
    setTimeout(() => setStatus('idle'), 2500);
  };

  const handleBeatMyScore = () => {
    startBattleGame(payload.levelId, payload.seed, {
      creatorUsername: payload.username,
      creatorAvatarEmoji: payload.avatarEmoji,
      creatorResult: { timeSeconds: payload.timeSeconds, mistakes: payload.mistakes },
    });
    onStartGame();
  };

  const handleChallengeFriend = async () => {
    const link = buildBattleInviteUrl({
      seed: payload.seed,
      levelId: payload.levelId,
      creatorUsername: payload.username,
      creatorAvatarEmoji: payload.avatarEmoji,
      createdAt: Date.now(),
      creatorResult: { timeSeconds: payload.timeSeconds, mistakes: payload.mistakes },
    });
    const outcome = await shareText(link, t('invite.battle.share'));
    if (outcome === 'copied') flashStatus('linkCopied');
  };

  const handleCopyLink = async () => {
    const outcome = await shareText(resultUrl, t('result.title', { name: payload.username }));
    if (outcome === 'copied') flashStatus('linkCopied');
  };

  const buildCard = () => {
    const { from, to } = getWorldHexGradient(payload.levelId);
    return generateShareCard({
      result: payload,
      worldTitle: t(`story.${world.key}.title`),
      difficultyName: t(`difficulty.${level.key}.name`),
      rankLabel: t(`share.rank.${payload.stars}`),
      gradientFrom: from,
      gradientTo: to,
      resultUrl,
    });
  };

  const handleShareImage = async () => {
    setGeneratingImage(true);
    try {
      const blob = await buildCard();
      const file = new File([blob], 'sudoku-prime-result.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t('result.title', { name: payload.username }) });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSaveImage = async () => {
    setGeneratingImage(true);
    try {
      const blob = await buildCard();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sudoku-prime-result.png';
      a.click();
      URL.revokeObjectURL(url);
      flashStatus('imageSaved');
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-gradient-to-br ${world.gradient} px-4 py-10`}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-800">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-5xl dark:bg-slate-700/60">
          {payload.avatarEmoji}
        </div>
        <h1 className="mt-4 font-display text-xl font-extrabold text-slate-900 dark:text-white">{payload.username}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('result.world')}: {t(`story.${world.key}.title`)} · {t(`difficulty.${level.key}.name`)}
        </p>

        <StarRating stars={payload.stars} size={26} className="mt-4" />
        <p className="mt-2 text-sm font-bold text-brand-600 dark:text-brand-400">
          {t('result.rank')}: {t(`share.rank.${payload.stars}`)}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-700/40">
            <p className="font-display text-base font-bold text-slate-900 dark:text-white">{formatTime(payload.timeSeconds)}</p>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{t('victory.time')}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-700/40">
            <p className="font-display text-base font-bold text-slate-900 dark:text-white">{payload.mistakes}</p>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{t('victory.mistakes')}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-700/40">
            <p className="font-display text-base font-bold text-slate-900 dark:text-white">{payload.hintsUsed}</p>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{t('toolbar.hint')}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={handleBeatMyScore}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:brightness-110 active:scale-95"
          >
            <Flame size={17} /> {t('result.beatMyScore')}
          </button>
          <button
            onClick={handleChallengeFriend}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Swords size={17} /> {t('result.challengeFriend')}
          </button>

          <div className="mt-1 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={handleShareImage} disabled={generatingImage}>
              <Share2 size={14} /> {t('result.shareImage')}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSaveImage} disabled={generatingImage}>
              <Download size={14} /> {t('result.saveImage')}
            </Button>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-transparent text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/40"
          >
            {status === 'linkCopied' ? <Check size={14} /> : <Link2 size={14} />}
            {status === 'linkCopied' ? t('result.linkCopied') : status === 'imageSaved' ? t('result.imageSaved') : t('result.copyLink')}
          </button>
        </div>

        <button
          onClick={onGoHome}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          <Home size={14} /> {t('result.playSudokuPrime')}
        </button>
      </div>
    </div>
  );
}
