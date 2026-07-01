import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { cn } from '../../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSettingsStore((state) => state.theme);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700/80',
        className,
      )}
    >
      <Sun
        size={20}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100 text-amber-500',
        )}
      />
      <Moon
        size={20}
        className={cn(
          'absolute transition-all duration-300',
          isDark ? 'scale-100 rotate-0 opacity-100 text-indigo-300' : 'scale-0 rotate-90 opacity-0',
        )}
      />
    </button>
  );
}
