import { cn } from '../../lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600',
      )}
    >
      <span
        className={cn(
          'absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
