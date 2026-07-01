import { useGameStore } from '../../store/useGameStore';
import { Cell } from './Cell';

export function GameBoard() {
  const board = useGameStore((state) => state.board);
  const solution = useGameStore((state) => state.solution);
  const selected = useGameStore((state) => state.selected);
  const selectCell = useGameStore((state) => state.selectCell);
  const mistakeFlashId = useGameStore((state) => state.mistakeFlashId);
  const lastMistakeCell = useGameStore((state) => state.lastMistakeCell);

  const selectedValue = selected ? board[selected.row][selected.col].value : 0;

  return (
    <div
      className="mx-auto grid w-full max-w-[min(92vw,32rem)] grid-cols-9 grid-rows-9 overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-900"
      role="grid"
      aria-label="Sudoku board"
    >
      {board.map((rowCells, row) =>
        rowCells.map((cell, col) => {
          const isSelected = selected?.row === row && selected?.col === col;
          const isPeer =
            !!selected &&
            !isSelected &&
            (selected.row === row ||
              selected.col === col ||
              (Math.floor(selected.row / 3) === Math.floor(row / 3) &&
                Math.floor(selected.col / 3) === Math.floor(col / 3)));
          const isSameValue = selectedValue !== 0 && cell.value === selectedValue;
          const isError = cell.value !== 0 && !cell.isGiven && cell.value !== solution[row][col];
          const isFlashing =
            !!lastMistakeCell && lastMistakeCell.row === row && lastMistakeCell.col === col && mistakeFlashId > 0;

          return (
            <Cell
              key={`${row}-${col}-${isFlashing ? mistakeFlashId : 'static'}`}
              cell={cell}
              row={row}
              col={col}
              isSelected={isSelected}
              isPeer={isPeer}
              isSameValue={isSameValue}
              isError={isError}
              isFlashing={isFlashing}
              style={{ animationDelay: `${(row * 9 + col) * 8}ms` }}
              onSelect={selectCell}
            />
          );
        }),
      )}
    </div>
  );
}
