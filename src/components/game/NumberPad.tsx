import { Delete } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { countCorrectlyPlaced, cn } from '../../lib/utils';

export function NumberPad() {
  const board = useGameStore((state) => state.board);
  const solution = useGameStore((state) => state.solution);
  const selected = useGameStore((state) => state.selected);
  const inputNumber = useGameStore((state) => state.inputNumber);
  const eraseSelectedCell = useGameStore((state) => state.eraseSelectedCell);
  const notesMode = useGameStore((state) => state.notesMode);

  const selectedCell = selected ? board[selected.row][selected.col] : null;
  const isSelectionNoted = (digit: number) => !!selectedCell?.notes.includes(digit);

  return (
    <div className="mx-auto grid w-full max-w-[min(92vw,32rem)] grid-cols-10 gap-1.5 sm:gap-2">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => {
        const remaining = 9 - countCorrectlyPlaced(board, solution, digit);
        const isDisabled = remaining <= 0;

        return (
          <button
            key={digit}
            disabled={isDisabled}
            onClick={() => inputNumber(digit)}
            className={cn(
              'relative flex aspect-square flex-col items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all active:scale-90 disabled:opacity-30',
              'hover:bg-brand-50 hover:text-brand-600 hover:ring-brand-200',
              'dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300',
              notesMode && isSelectionNoted(digit) && 'ring-2 ring-brand-400',
            )}
          >
            {digit}
          </button>
        );
      })}
      <button
        onClick={eraseSelectedCell}
        aria-label="Erase"
        className="flex aspect-square items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-200 active:scale-90 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-rose-500/10"
      >
        <Delete size={18} />
      </button>
    </div>
  );
}
