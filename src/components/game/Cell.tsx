import { memo, useRef, type CSSProperties } from 'react';
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
  isBoxGlowing: boolean;
  isConflictHighlighted: boolean;
  isRelaxedMistakes: boolean;
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
  isBoxGlowing,
  isConflictHighlighted,
  isRelaxedMistakes,
  onSelect,
}: CellProps) {
  const borderRight = col % 3 === 2 && col !== 8;
  const borderBottom = row % 3 === 2 && row !== 8;

  // Setting `animation` inline (rather than a second Tailwind class) gives
  // these one-shot effects the specificity they need to actually play — two
  // classes that both set the `animation` shorthand don't merge, one just
  // silently wins the cascade.
  const animationOverride = isBoxGlowing
    ? 'box-glow 1100ms ease-out 0ms'
    : isFlashing && !isRelaxedMistakes
      ? 'shake 0.4s ease-in-out 0ms'
      : undefined;

  // Once a cell has had an inline `animation` override, it must never fall back
  // to "no inline style" afterward — removing the override makes the browser
  // treat a class-based animation as freshly (re-)assigned, which restarts it
  // and makes the cell's contents flash invisible again. Pinning it to an
  // explicit `none` instead keeps it permanently settled. (There's no more
  // per-cell entrance animation to worry about clashing with — see GameBoard,
  // which fades the whole board in as one unit instead of staggering each
  // of the 81 cells individually. A per-cell wave looked fine on a fast
  // machine, but on a slower device or under momentary jank it could render
  // as "top-left corner appears, then everything else snaps in" rather than
  // a smooth wave, since dropped frames make the stagger's timing visible as
  // a jump instead of motion.)
  const hasHadOverrideRef = useRef(false);
  if (animationOverride) hasHadOverrideRef.current = true;

  const combinedStyle: CSSProperties | undefined = animationOverride
    ? { animation: animationOverride }
    : hasHadOverrideRef.current
      ? { animation: 'none' }
      : undefined;

  return (
    <button
      onClick={() => onSelect(row, col)}
      data-row={row}
      data-col={col}
      data-given={cell.isGiven}
      style={combinedStyle}
      className={cn(
        'sudoku-cell relative flex aspect-square items-center justify-center border-[0.5px] border-slate-200 text-[clamp(0.9rem,4vw,1.35rem)] font-semibold transition-all duration-150 select-none dark:border-slate-700/70',
        'active:scale-[0.94]',
        borderRight && 'border-r-2 border-r-slate-300 dark:border-r-slate-500 cell-border-right',
        borderBottom && 'border-b-2 border-b-slate-300 dark:border-b-slate-500 cell-border-bottom',
        isSelected && 'bg-brand-200/70 dark:bg-brand-500/30 cell-selected',
        !isSelected && isSameValue && cell.value !== 0 && 'bg-brand-100/70 dark:bg-brand-500/15 cell-same-value',
        !isSelected && !isSameValue && isPeer && 'bg-slate-100/80 dark:bg-slate-800/50 cell-peer',
        !isSelected && !isPeer && !isSameValue && 'bg-white dark:bg-slate-900/40 cell-idle',
        cell.isGiven ? 'text-slate-800 dark:text-slate-100 cell-given' : 'text-brand-600 dark:text-brand-300 cell-user',
        isBoxGlowing && 'cell-box-glowing',
        isError && (isRelaxedMistakes ? 'text-amber-500 dark:text-amber-400 cell-soft-error' : 'text-rose-500 dark:text-rose-400 cell-error'),
        cell.wasHinted && 'text-accent-600 dark:text-accent-400 cell-hinted',
        isConflictHighlighted && 'ring-2 ring-inset ring-rose-300 dark:ring-rose-500/60 cell-conflict',
      )}
    >
      {cell.value !== 0 ? (
        <span key={cell.value} className="animate-pop">
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
