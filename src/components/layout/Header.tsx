import { BarChart3, Settings, Users } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useT } from '../../lib/i18n';
import { cn } from '../../lib/utils';

interface HeaderProps {
  onOpenStats?: () => void;
  onOpenSettings?: () => void;
  onOpenOnline?: () => void;
}

export function Header({ onOpenStats, onOpenSettings, onOpenOnline }: HeaderProps) {
  const t = useT();
  const isOnline = useOnlineStatus();

  return (
    <header className="flex items-center justify-between px-4 py-6 sm:px-8 sm:py-8">
      {/* No gradient icon-square logo mark — a plain serif wordmark reads as
          a considered typographic choice rather than a generic "app icon in
          a rounded gradient tile", matching the editorial voice already
          established on the game screen (Playfair Display level titles). */}
      <div>
        <h1 className="font-serif text-2xl font-bold leading-tight text-slate-900 dark:text-white sm:text-3xl">
          Sudoku Prime
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('header.subtitle')}</p>
      </div>
      <div className="flex items-center gap-2">
        {onOpenOnline && (
          <button
            onClick={onOpenOnline}
            aria-label={t('header.online')}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-brand-600 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/80"
          >
            <Users size={20} />
            <span
              className={cn(
                'absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-800',
                isOnline ? 'bg-accent-500' : 'bg-slate-300 dark:bg-slate-600',
              )}
            />
          </button>
        )}
        {onOpenStats && (
          <button
            onClick={onOpenStats}
            aria-label={t('header.viewStats')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-brand-600 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/80"
          >
            <BarChart3 size={20} />
          </button>
        )}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            aria-label={t('header.settings')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-brand-600 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/80"
          >
            <Settings size={20} />
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
