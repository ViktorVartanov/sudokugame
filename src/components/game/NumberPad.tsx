import { Delete, Check } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useT } from '../../lib/i18n';
import { countCorrectlyPlaced, cn } from '../../lib/utils';

export function NumberPad() {
  const board = useGameStore((state) => state.board);
  const solution = useGameStore((state) => state.solution);
  const selected = useGameStore((state) => state.selected);
  const inputNumber = useGameStore((state) => state.inputNumber);
  const eraseSelectedCell = useGameStore((state) => state.eraseSelectedCell);
  const notesMode = useGameStore((state) => state.notesMode);
  const t = useT();

  const selectedCell = selected ? board[selected.row][selected.col] : null;
  const isSelectionNoted = (digit: number) => !!selectedCell?.notes.includes(digit);

  return (
    <div className="mx-auto grid w-full max-w-[min(92vw,32rem)] grid-cols-10 gap-1 sm:gap-2">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => {
        const placed = countCorrectlyPlaced(board, solution, digit);
        const isCompleted = placed >= 9;

        return (
          <button
            key={digit}
            disabled={isCompleted}
            onClick={() => inputNumber(digit)}
            className={cn(
              'relative flex h-14 items-center justify-center rounded-xl bg-white font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all active:scale-90 disabled:active:scale-100 sm:h-16 sm:rounded-2xl',
              'hover:bg-brand-50 hover:text-brand-600 hover:ring-brand-200',
              'dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300',
              notesMode && isSelectionNoted(digit) && 'ring-2 ring-brand-400',
              isCompleted &&
                'bg-accent-50 text-accent-600 ring-accent-200 hover:bg-accent-50 hover:text-accent-600 hover:ring-accent-200 dark:bg-accent-500/10 dark:text-accent-400 dark:ring-accent-500/30 dark:hover:bg-accent-500/10 dark:hover:text-accent-400',
            )}
          >
            <span className="text-base leading-none sm:text-xl">{digit}</span>
            {isCompleted && (
              <Check size={10} className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5" strokeWidth={3} />
            )}
          </button>
        );
      })}
      <button
        onClick={eraseSelectedCell}
        aria-label={t('toolbar.erase')}
        className="flex h-14 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-200 active:scale-90 sm:h-16 sm:rounded-2xl dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-rose-500/10"
      >
        <Delete size={16} className="sm:h-5 sm:w-5" />
      </button>
    </div>
  );
}
