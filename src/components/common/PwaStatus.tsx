import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { CheckCircle2, RefreshCw, X, WifiOff } from 'lucide-react';
import { useT } from '../../lib/i18n';
import { cn } from '../../lib/utils';

const HOUR_IN_MS = 60 * 60 * 1000;
const OFFLINE_READY_AUTO_DISMISS_MS = 4500;

/**
 * Registers the service worker and surfaces two states as dismissible toasts:
 * "offline ready" (first successful cache, per PWA requirement) and
 * "update available" (a new version was precached and is waiting to activate).
 */
export function PwaStatus() {
  const t = useT();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Long-lived tabs only get update checks on navigation by default;
      // poll periodically so users eventually see the "update available" toast.
      if (registration) {
        setInterval(() => registration.update(), HOUR_IN_MS);
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration failed:', error);
    },
  });

  // "Offline ready" is an FYI, not an action — auto-dismiss it so it can't
  // linger over the header buttons underneath. "Update available" needs an
  // explicit user choice (Reload), so it stays until dismissed or acted on.
  useEffect(() => {
    if (!offlineReady || needRefresh) return;
    const timeout = setTimeout(() => setOfflineReady(false), OFFLINE_READY_AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [offlineReady, needRefresh, setOfflineReady]);

  if (!offlineReady && !needRefresh) return null;

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <div
        className={cn(
          'pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-2xl bg-white p-3.5 pl-4 shadow-xl ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700/60',
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
            needRefresh ? 'bg-gradient-to-br from-brand-500 to-brand-700' : 'bg-gradient-to-br from-accent-500 to-accent-600',
          )}
        >
          {needRefresh ? <RefreshCw size={16} /> : <CheckCircle2 size={16} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {needRefresh ? t('pwa.updateAvailable') : t('pwa.offlineReady')}
          </p>
          <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            {needRefresh ? (
              t('pwa.updateBody')
            ) : (
              <>
                <WifiOff size={11} className="shrink-0" /> {t('pwa.offlineBody')}
              </>
            )}
          </p>
        </div>

        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="shrink-0 rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600 active:scale-95"
          >
            {t('pwa.reload')}
          </button>
        )}

        <button
          onClick={close}
          aria-label={t('pwa.dismiss')}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
