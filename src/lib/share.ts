export type ShareOutcome = 'shared' | 'cancelled' | 'copied' | 'failed';

/**
 * Shares plain text via the Web Share API when available (mobile browsers,
 * some desktop browsers), falling back to the clipboard otherwise. Works
 * fully offline since neither path touches the network.
 */
export async function shareText(text: string, title: string): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text, title });
      return 'shared';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
      // Fall through to clipboard if the share sheet itself failed for another reason.
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
