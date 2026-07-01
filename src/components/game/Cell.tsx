import { memo, type CSSProperties } from 'react';
import type { CellState } from '../../types/sudoku';
import { cn } from '../../lib/utils';

interface CellProps {
  cell: CellState;
  row: number;
  col: number;
  isSelected: boolean;
  isPeer: boolean;
  isSameValue: boolean;
  isError: boolean;
  isFlashing: boolean;
  style?: CSSProperties;
  onSelect: (row: number, col: number) => void;
}

function CellComponent({
  cell,
  row,
  col,
  isSelected,
  isPeer,
  isSameValue,
  isError,
  isFlashing,
  style,
  onSelect,
}: CellProps) {
  const borderRight = col % 3 === 2 && col !== 8;
  const borderBottom = row % 3 === 2 && row !== 8;

  return (
    <button
      onClick={() => onSelect(row, col)}
      data-row={row}
      data-col={col}
      data-given={cell.isGiven}
      style={style}
      className={cn(
        'relative flex aspect-square animate-cell-in items-center justify-center border-[0.5px] border-slate-200 text-[clamp(0.9rem,4vw,1.35rem)] font-semibold transition-all duration-150 select-none dark:border-slate-700/70',
        'active:scale-[0.94]',
        borderRight && 'border-r-2 border-r-slate-300 dark:border-r-slate-500',
        borderBottom && 'border-b-2 border-b-slate-300 dark:border-b-slate-500',
        isSelected && 'bg-brand-200/70 dark:bg-brand-500/30',
        !isSelected && isSameValue && cell.value !== 0 && 'bg-brand-100/70 dark:bg-brand-500/15',
        !isSelected && !isSameValue && isPeer && 'bg-slate-100/80 dark:bg-slate-800/50',
        !isSelected && !isPeer && !isSameValue && 'bg-white dark:bg-slate-900/40',
        cell.isGiven ? 'text-slate-800 dark:text-slate-100' : 'text-brand-600 dark:text-brand-300',
        isError && 'text-rose-500 dark:text-rose-400',
        cell.wasHinted && 'text-accent-600 dark:text-accent-400',
        isFlashing && 'animate-shake',
      )}
    >
      {cell.value !== 0 ? (
        <span key={cell.value} className={cn('animate-pop', isFlashing && 'text-rose-500')}>
          {cell.value}
        </span>
      ) : cell.notes.length > 0 ? (
        <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-0 p-0.5 sm:p-1 animate-fade-in">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className="flex items-center justify-center text-[0.5rem] font-medium leading-none text-slate-400 sm:text-[0.6rem] dark:text-slate-500"
            >
              {cell.notes.includes(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

export const Cell = memo(CellComponent);
