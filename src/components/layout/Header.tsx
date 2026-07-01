import { Grid3x3, BarChart3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onOpenStats?: () => void;
}

export function Header({ onOpenStats }: HeaderProps) {
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
          <p className="text-xs text-slate-500 dark:text-slate-400">Ten levels of mastery</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onOpenStats && (
          <button
            onClick={onOpenStats}
            aria-label="View stats"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-brand-600 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/80"
          >
            <BarChart3 size={20} />
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
