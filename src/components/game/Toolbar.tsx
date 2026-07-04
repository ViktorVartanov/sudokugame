import type { ReactNode } from 'react';
import { Undo2, PenLine, Lightbulb, Eraser } from 'lucide-react';
import { useGameStore, MAX_HINTS } from '../../store/useGameStore';
import { useT } from '../../lib/i18n';
import { cn } from '../../lib/utils';

interface ToolbarButtonProps {
  icon: ReactNode;
  label: string;
  sublabel?: string;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({ icon, label, sublabel, badge, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-slate-600 transition-all active:scale-95 disabled:opacity-30 dark:text-slate-300',
        active
          ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'
          : 'hover:bg-brand-50 dark:hover:bg-brand-500/10',
      )}
    >
      {icon}
      <span className="text-[11px] font-semibold leading-none">{label}</span>
      {sublabel && (
        <span className="text-[9px] font-bold uppercase leading-none tracking-wide text-slate-400 dark:text-slate-500">
          {sublabel}
        </span>
      )}
      {badge && (
        <span className="absolute -top-1 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

export function Toolbar() {
  const notesMode = useGameStore((state) => state.notesMode);
  const toggleNotesMode = useGameStore((state) => state.toggleNotesMode);
  const undo = useGameStore((state) => state.undo);
  const historyLength = useGameStore((state) => state.history.length);
  const useHint = useGameStore((state) => state.useHint);
  const hintsUsed = useGameStore((state) => state.hintsUsed);
  const eraseSelectedCell = useGameStore((state) => state.eraseSelectedCell);
  const selected = useGameStore((state) => state.selected);
  const t = useT();

  const hintsRemaining = MAX_HINTS - hintsUsed;

  return (
    <div className="mx-auto flex w-full max-w-[min(92vw,32rem)] gap-1 rounded-2xl bg-brand-50/70 p-1.5 shadow-sm ring-1 ring-brand-100 dark:bg-brand-500/10 dark:ring-brand-500/20">
      <ToolbarButton icon={<Undo2 size={20} />} label={t('toolbar.undo')} disabled={historyLength === 0} onClick={undo} />
      <ToolbarButton
        icon={<Eraser size={20} />}
        label={t('toolbar.erase')}
        disabled={!selected}
        onClick={eraseSelectedCell}
      />
      <ToolbarButton
        icon={<PenLine size={20} />}
        label={t('toolbar.notes')}
        sublabel={notesMode ? t('toolbar.notesOn') : t('toolbar.notesOff')}
        active={notesMode}
        onClick={toggleNotesMode}
      />
      <ToolbarButton
        icon={<Lightbulb size={20} />}
        label={t('toolbar.hint')}
        badge={String(hintsRemaining)}
        disabled={hintsRemaining <= 0}
        onClick={useHint}
      />
    </div>
  );
}
