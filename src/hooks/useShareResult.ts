import { useState } from 'react';
import { shareText, type ShareOutcome } from '../lib/share';
import { useT } from '../lib/i18n';

export type ShareStatus = 'idle' | 'shared' | 'copied' | 'failed';

const STATUS_RESET_MS = 2500;

/** Drives a share button's label/status across the Web Share API + clipboard fallback. */
export function useShareResult() {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const t = useT();

  const share = async (text: string) => {
    const outcome: ShareOutcome = await shareText(text, 'Sudoku Prime');
    if (outcome === 'cancelled') return;
    setStatus(outcome === 'shared' ? 'shared' : outcome === 'copied' ? 'copied' : 'failed');
    setTimeout(() => setStatus('idle'), STATUS_RESET_MS);
  };

  const label =
    status === 'shared'
      ? t('victory.shared')
      : status === 'copied'
        ? t('victory.copied')
        : status === 'failed'
          ? t('victory.shareFailed')
          : t('victory.share');

  return { share, status, label };
}
