import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getBoxIndex, cn } from '../../lib/utils';
import { getStoryWorld } from '../../lib/storyWorlds';
import { Cell } from './Cell';

const BOX_GLOW_DURATION_MS = 1150;
const CONFLICT_HIGHLIGHT_DURATION_MS = 1400;

export function GameBoard() {
  const board = useGameStore((state) => state.board);
  const solution = useGameStore((state) => state.solution);
  const selected = useGameStore((state) => state.selected);
  const selectCell = useGameStore((state) => state.selectCell);
  const mistakeFlashId = useGameStore((state) => state.mistakeFlashId);
  const lastMistakeCell = useGameStore((state) => state.lastMistakeCell);
  const boxGlowIndex = useGameStore((state) => state.boxGlowIndex);
  const boxGlowId = useGameStore((state) => state.boxGlowId);
  const clearBoxGlow = useGameStore((state) => state.clearBoxGlow);
  const conflictHighlight = useGameStore((state) => state.conflictHighlight);
  const conflictHighlightId = useGameStore((state) => state.conflictHighlightId);
  const clearConflictHighlight = useGameStore((state) => state.clearConflictHighlight);
  const relaxedMistakes = useSettingsStore((state) => state.relaxedMistakes);
  const useLevelVisual = useSettingsStore((state) => state.useLevelVisual);
  const levelId = useGameStore((state) => state.levelId);

  const selectedValue = selected ? board[selected.row][selected.col].value : 0;
  const world = levelId !== null ? getStoryWorld(levelId) : null;
  // A thin solid-color border read as "the same frame, different color" —
  // an actual per-world textured material (wood grain, glass sheen, starfield,
  // etc. — see .frame-* in index.css) plus the world's own glow color (already
  // used for the victory icon) makes each world's frame feel genuinely distinct.
  const frameTexture = useLevelVisual && world ? `frame-${world.motif}` : '';
  const boardGlow = useLevelVisual && world ? world.glow : '';
  // Neon District's glowing edge (boardGlow) already reads as "the light
  // source" for that world — an inset bevel on top of it would look like two
  // competing light sources instead of a coherent material.
  const useBevel = !!frameTexture && world?.motif !== 'circuit';

  useEffect(() => {
    if (boxGlowIndex === null) return;
    const timeout = setTimeout(clearBoxGlow, BOX_GLOW_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [boxGlowIndex, boxGlowId, clearBoxGlow]);

  useEffect(() => {
    if (!conflictHighlight) return;
    const timeout = setTimeout(clearConflictHighlight, CONFLICT_HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [conflictHighlight, conflictHighlightId, clearConflictHighlight]);

  const isInConflictHighlight = (row: number, col: number) => {
    if (!conflictHighlight) return false;
    if (conflictHighlight.kind === 'row') return row === conflictHighlight.row;
    if (conflictHighlight.kind === 'col') return col === conflictHighlight.col;
    return getBoxIndex(row, col) === getBoxIndex(conflictHighlight.row, conflictHighlight.col);
  };

  return (
    // Outer element is the actual "frame": a padded ring carrying the per-world
    // texture, with the playable grid inset inside it — a textured background
    // can't be painted directly on a <border>, so the frame is a real element
    // with its own background, not a border-color trick.
    <div
      className={cn(
        'h-full w-full rounded-2xl p-3 shadow-xl transition-colors duration-300 animate-fade-up sm:p-4',
        frameTexture || 'bg-slate-300 dark:bg-slate-600',
        boardGlow && `shadow-2xl ${boardGlow}`,
        useBevel && 'frame-bevel',
      )}
    >
      <div
        className="grid h-full w-full grid-cols-9 grid-rows-9 overflow-hidden rounded-xl bg-white dark:bg-slate-900"
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
            const isBoxGlowing = boxGlowIndex !== null && getBoxIndex(row, col) === boxGlowIndex;
            const isConflictHighlighted = isInConflictHighlight(row, col);

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
                isBoxGlowing={isBoxGlowing}
                isConflictHighlighted={isConflictHighlighted}
                isRelaxedMistakes={relaxedMistakes}
                onSelect={selectCell}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
