import { useSettingsStore } from '../../store/useSettingsStore';
import type { ColorTheme } from '../../types/sudoku';
import { cn } from '../../lib/utils';

const THEMES: { id: ColorTheme; label: string; swatch: string }[] = [
  { id: 'default', label: 'Classic', swatch: 'bg-gradient-to-br from-[#7057ff] to-[#4c2bd0]' },
  { id: 'sakura', label: 'Sakura', swatch: 'bg-gradient-to-br from-[#fb7dae] to-[#c02a5e]' },
  { id: 'ocean', label: 'Ocean', swatch: 'bg-gradient-to-br from-[#3ea9f5] to-[#0c599c]' },
  { id: 'neon', label: 'Neon', swatch: 'bg-gradient-to-br from-[#e35bf5] to-[#7f0a99]' },
  { id: 'sunset', label: 'Sunset', swatch: 'bg-gradient-to-br from-[#fb923c] to-[#c2410c]' },
];

interface ThemePickerProps {
  className?: string;
}

export function ThemePicker({ className }: ThemePickerProps) {
  const colorTheme = useSettingsStore((state) => state.colorTheme);
  const setColorTheme = useSettingsStore((state) => state.setColorTheme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  const handleSelect = (id: ColorTheme) => {
    setColorTheme(id);
    if (id === 'neon') setTheme('dark');
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {THEMES.map((theme) => {
        const isActive = colorTheme === theme.id;

        return (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            aria-label={theme.label}
            title={theme.label}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90',
              theme.swatch,
              isActive
                ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900'
                : 'ring-1 ring-black/10 dark:ring-white/10',
            )}
          />
        );
      })}
    </div>
  );
}
