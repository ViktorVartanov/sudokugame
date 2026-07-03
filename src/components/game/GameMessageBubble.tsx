import { useEffect, useState } from 'react';
import { Lightbulb, Sparkles, AlertCircle, X } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useT } from '../../lib/i18n';
import { cn } from '../../lib/utils';

const AUTO_DISMISS_MS = 5000;
const TRANSITION_MS = 220;

const TONE_STYLES = {
  hint: {
    icon: Lightbulb,
    wrapper: 'bg-brand-50 ring-brand-200 dark:bg-brand-500/10 dark:ring-brand-500/30',
    iconWrapper: 'bg-gradient-to-br from-brand-500 to-brand-700 text-white',
  },
  coach: {
    icon: Sparkles,
    wrapper: 'bg-accent-50 ring-accent-200 dark:bg-accent-500/10 dark:ring-accent-500/30',
    iconWrapper: 'bg-gradient-to-br from-accent-500 to-accent-600 text-white',
  },
  mistake: {
    icon: AlertCircle,
    wrapper: 'bg-rose-50 ring-rose-200 dark:bg-rose-500/10 dark:ring-rose-500/30',
    iconWrapper: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white',
  },
} as const;

export function GameMessageBubble() {
  const gameMessage = useGameStore((state) => state.gameMessage);
  const hintStage = useGameStore((state) => state.hintStage);
  const dismissGameMessage = useGameStore((state) => state.dismissGameMessage);
  const t = useT();

  useEffect(() => {
    if (!gameMessage || gameMessage.tone === 'hint') return;
    const timeout = setTimeout(dismissGameMessage, AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [gameMessage, dismissGameMessage]);

  // Keep rendering the last message's content while it fades out, instead of
  // unmounting it the instant gameMessage clears — otherwise there's nothing
  // left to animate and the bubble just disappears mid-transition.
  const [displayedMessage, setDisplayedMessage] = useState(gameMessage);
  useEffect(() => {
    if (gameMessage) {
      setDisplayedMessage(gameMessage);
      return;
    }
    const timeout = setTimeout(() => setDisplayedMessage(null), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [gameMessage]);

  const style = displayedMessage ? TONE_STYLES[displayedMessage.tone] : null;
  const Icon = style?.icon;
  const visible = !!gameMessage;

  // Always render this wrapper (never mount/unmount based on gameMessage) and
  // animate `max-height` + opacity instead of toggling display. Popping the
  // bubble in and out changed the flex column's available height, which
  // forced the board (sized via `shrink` + `aspect-square`) to immediately
  // recompute and re-render all 81 cells — visible as a jank/overlap flash.
  // (An earlier attempt used the CSS Grid `0fr`/`1fr` row-sizing trick, but
  // Safari doesn't reliably interpolate `fr`-unit grid-template-rows
  // transitions — it can just snap instantly. `max-height` is universally
  // supported and actually animates everywhere.)
  return (
    <div
      className={cn(
        'w-full shrink-0 overflow-hidden transition-[max-height,opacity] duration-200 ease-out',
        visible ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0',
      )}
    >
      {displayedMessage && style && Icon && (
        <div
          className={cn(
            'mx-auto flex w-full max-w-[min(92vw,32rem)] items-start gap-2.5 rounded-2xl p-3 ring-1',
            style.wrapper,
          )}
        >
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', style.iconWrapper)}>
            <Icon size={16} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{displayedMessage.text}</p>
            {displayedMessage.tone === 'hint' && hintStage > 0 && hintStage < 3 && (
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{t('gameMessage.hintContinue')}</p>
            )}
            {displayedMessage.tone === 'hint' && hintStage >= 3 && (
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{t('gameMessage.hintReveal')}</p>
            )}
          </div>
          <button
            onClick={dismissGameMessage}
            aria-label={t('gameMessage.close')}
            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
