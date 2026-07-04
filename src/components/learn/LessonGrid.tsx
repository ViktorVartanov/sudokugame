import type { CellPos, LessonBoard } from '../../lib/lessons';
import { cn } from '../../lib/utils';

interface LessonGridProps {
  board: LessonBoard;
  /** Pre-highlights pattern/target cells to illustrate the answer — used for worked examples, not practice (where the player has to find them). */
  revealAnswer?: boolean;
  interactive?: boolean;
  selectedCell?: CellPos | null;
  feedback?: 'correct' | 'incorrect' | null;
  onCellClick?: (row: number, col: number) => void;
}

function posEquals(a: CellPos, b: [number, number]) {
  return a[0] === b[0] && a[1] === b[1];
}

export function LessonGrid({ board, revealAnswer, interactive, selectedCell, feedback, onCellClick }: LessonGridProps) {
  const cellMap = new Map(board.cells.map((c) => [`${c.row},${c.col}`, c]));

  return (
    <div className="mx-auto grid aspect-square w-full max-w-xs grid-cols-9 grid-rows-9 overflow-hidden rounded-xl border-2 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => {
          const data = cellMap.get(`${row},${col}`);
          const borderRight = col % 3 === 2 && col !== 8;
          const borderBottom = row % 3 === 2 && row !== 8;
          const isPattern = revealAnswer && board.patternCells.some((p) => posEquals(p, [row, col]));
          const isTarget = revealAnswer && board.targetCells.some((p) => posEquals(p, [row, col]));
          const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
          const isClickable = interactive && !!data;

          return (
            <button
              key={`${row}-${col}`}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onCellClick?.(row, col)}
              className={cn(
                'relative flex aspect-square items-center justify-center border-[0.5px] border-slate-100 text-[clamp(0.65rem,3vw,0.95rem)] font-semibold dark:border-slate-800',
                borderRight && 'border-r-2 border-r-slate-300 dark:border-r-slate-500',
                borderBottom && 'border-b-2 border-b-slate-300 dark:border-b-slate-500',
                !data && 'bg-slate-50/60 dark:bg-slate-800/30',
                isTarget && feedback !== 'correct' && 'bg-amber-100 dark:bg-amber-500/20',
                isPattern && !isTarget && 'bg-brand-100/70 dark:bg-brand-500/15',
                isSelected && feedback === 'correct' && 'bg-emerald-200 dark:bg-emerald-500/30',
                isSelected && feedback === 'incorrect' && 'bg-rose-200 dark:bg-rose-500/30',
                isSelected && !feedback && 'bg-brand-200/70 dark:bg-brand-500/30',
                // Excludes the just-answered cell so a lingering mouse hover
                // (very likely right after a click) can't visually mask the
                // feedback color underneath it.
                isClickable && !isSelected && 'cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-500/10',
              )}
            >
              {data?.given !== undefined ? (
                <span className="text-slate-800 dark:text-slate-100">{data.given}</span>
              ) : data?.candidates ? (
                <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-0 p-0.5">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                    <span
                      key={n}
                      className="flex items-center justify-center text-[0.45rem] font-medium leading-none text-slate-500 sm:text-[0.55rem] dark:text-slate-400"
                    >
                      {data.candidates!.includes(n) ? n : ''}
                    </span>
                  ))}
                </div>
              ) : null}
            </button>
          );
        }),
      )}
    </div>
  );
}
