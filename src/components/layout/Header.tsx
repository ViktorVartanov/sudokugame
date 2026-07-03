import { Grid3x3, BarChart3, Settings, Users } from 'lucide-react';
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
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 transition-transform duration-300 hover:rotate-6">
          <Grid3x3 size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold leading-tight text-slate-900 dark:text-white">
            Sudoku Prime
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('header.subtitle')}</p>
        </div>
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
