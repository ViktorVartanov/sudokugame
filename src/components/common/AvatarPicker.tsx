import { cn } from '../../lib/utils';
import { AVATAR_OPTIONS } from '../../lib/avatars';

interface AvatarPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATAR_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          aria-label={emoji}
          aria-pressed={value === emoji}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition-all active:scale-90',
            value === emoji
              ? 'bg-brand-500 ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700',
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
