import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

/** Maps physical keyboard input to game actions when a puzzle is active. */
export function useKeyboardInput() {
  const selected = useGameStore((state) => state.selected);
  const selectCell = useGameStore((state) => state.selectCell);
  const inputNumber = useGameStore((state) => state.inputNumber);
  const eraseSelectedCell = useGameStore((state) => state.eraseSelectedCell);
  const toggleNotesMode = useGameStore((state) => state.toggleNotesMode);
  const togglePause = useGameStore((state) => state.togglePause);
  const undo = useGameStore((state) => state.undo);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (/^[1-9]$/.test(event.key)) {
        inputNumber(Number(event.key));
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        eraseSelectedCell();
        return;
      }

      if (event.key.toLowerCase() === 'n') {
        toggleNotesMode();
        return;
      }

      if (event.key.toLowerCase() === 'p' || event.key === ' ') {
        event.preventDefault();
        togglePause();
        return;
      }

      if (event.key.toLowerCase() === 'z' && event.metaKey === false) {
        undo();
        return;
      }

      if (selected && event.key.startsWith('Arrow')) {
        event.preventDefault();
        const { row, col } = selected;
        const deltas: Record<string, [number, number]> = {
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1],
        };
        const [dr, dc] = deltas[event.key];
        const nextRow = Math.min(8, Math.max(0, row + dr));
        const nextCol = Math.min(8, Math.max(0, col + dc));
        selectCell(nextRow, nextCol);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, selectCell, inputNumber, eraseSelectedCell, toggleNotesMode, togglePause, undo]);
}
