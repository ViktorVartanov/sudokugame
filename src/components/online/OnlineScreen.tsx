import { useState } from 'react';
import { ArrowLeft, Swords, Share2, Check, Play } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useT } from '../../lib/i18n';
import { buildBattleInviteUrl } from '../../lib/deepLinks';
import { generateSeed } from '../../lib/seededRandom';
import { shareText } from '../../lib/share';
import { DIFFICULTY_LEVELS } from '../../lib/difficulty';
import { Button } from '../common/Button';

interface OnlineScreenProps {
  onBack: () => void;
  onStartGame: (levelId: number, seed: number) => void;
}

/**
 * A single self-contained "challenge a friend" screen — no accounts, no
 * server. The puzzle seed + difficulty + your nickname (see Settings) are
 * all encoded directly into the shared link (see lib/deepLinks.ts), so
 * whoever opens it gets the exact same puzzle with zero backend involved.
 *
 * There's no live sync to know when a friend has actually opened the link,
 * so "starting together" is coordinated manually: generate the link, send
 * it, and once your friend confirms (over chat, a call, whatever) that
 * they've opened it, each of you presses your own "Start Game" button.
 */
export function OnlineScreen({ onBack, onStartGame }: OnlineScreenProps) {
  const t = useT();
  const nickname = useSettingsStore((state) => state.nickname);
  const avatarEmoji = useSettingsStore((state) => state.avatarEmoji);
  const [levelId, setLevelId] = useState(1);
  const [seed, setSeed] = useState<number | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const newSeed = generateSeed();
    setSeed(newSeed);
    setLink(
      buildBattleInviteUrl({
        seed: newSeed,
        levelId,
        creatorUsername: nickname.trim() || 'Player',
        creatorAvatarEmoji: avatarEmoji,
        createdAt: Date.now(),
      }),
    );
  };

  const handleCopy = async () => {
    if (!link) return;
    const outcome = await shareText(link, t('invite.battle.share'));
    if (outcome === 'copied' || outcome === 'shared') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = () => {
    if (seed === null) return;
    onStartGame(levelId, seed);
  };

  return (
    <div className="min-h-screen bg-noise">
      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-8">
        <header className="flex items-center gap-3 py-6 sm:py-8">
          <button
            onClick={onBack}
            aria-label={t('settings.back')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/80"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="truncate font-display text-lg font-bold leading-tight text-slate-900 dark:text-white">
            {t('online.title')}
          </h1>
        </header>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
              <Swords size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-slate-800 dark:text-slate-100">
                {t('invite.battle.share')}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t('invite.battle.shareBody')}</p>
            </div>
          </div>

          {!link ? (
            <>
              <select
                value={levelId}
                onChange={(e) => setLevelId(Number(e.target.value))}
                className="mt-4 h-11 w-full rounded-xl bg-slate-100 px-3.5 text-sm text-slate-700 outline-none dark:bg-slate-700/60 dark:text-slate-200"
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {t(`difficulty.${level.key}.name`)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                className="mt-3 w-full rounded-xl bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
              >
                {t('invite.generate')}
              </button>
            </>
          ) : (
            <>
              <div className="mt-4 flex items-center gap-2">
                <input
                  readOnly
                  value={link}
                  className="h-11 min-w-0 flex-1 truncate rounded-xl bg-slate-100 px-3.5 text-xs text-slate-500 outline-none dark:bg-slate-700/60 dark:text-slate-400"
                />
                <button
                  onClick={handleCopy}
                  aria-label={t('invite.copyLink')}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white transition-colors hover:bg-rose-600"
                >
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
              </div>

              <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">{t('invite.battle.readyHint')}</p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopy}
                  className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {copied ? <Check size={16} /> : <Share2 size={16} />} {t('invite.copyLink')}
                </button>
                <Button variant="primary" onClick={handleStartGame} className="h-12">
                  <Play size={16} /> {t('invite.battle.startGame')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
