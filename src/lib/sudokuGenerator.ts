import type { Grid, PuzzleData } from '../types/sudoku';
import { countSolutions, generateFullGrid } from './sudokuSolver';

const TOTAL_CELLS = 81;
const MIN_CLUES_FLOOR = 22;
const MAX_DIG_ATTEMPTS = 12;

function shuffledIndices(rng: () => number): number[] {
  const indices = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/** Attempts a single pass of digging holes into a solved grid down to `targetClues`. */
function digOnce(solution: Grid, targetClues: number, rng: () => number): { puzzle: Grid; clues: number } {
  const puzzle = solution.map((row) => [...row]);
  const order = shuffledIndices(rng);
  let clues = TOTAL_CELLS;

  for (const index of order) {
    if (clues <= targetClues) break;

    const row = Math.floor(index / 9);
    const col = index % 9;
    if (puzzle[row][col] === 0) continue;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    if (countSolutions(puzzle, 2) === 1) {
      clues--;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, clues };
}

/**
 * Generates a Sudoku puzzle with a unique solution containing (as close as
 * achievable) `targetClues` given cells. Retries with fresh solved grids
 * when a digging pass gets stuck above the target.
 */
export function generatePuzzle(targetClues: number, rng: () => number = Math.random): PuzzleData {
  const clampedTarget = Math.max(MIN_CLUES_FLOOR, Math.min(targetClues, TOTAL_CELLS - 1));

  let best: { puzzle: Grid; clues: number; solution: Grid } | null = null;

  for (let attempt = 0; attempt < MAX_DIG_ATTEMPTS; attempt++) {
    const solution = generateFullGrid(rng);
    const { puzzle, clues } = digOnce(solution, clampedTarget, rng);

    if (!best || clues < best.clues) {
      best = { puzzle, clues, solution };
    }
    if (clues <= clampedTarget) break;
  }

  return { puzzle: best!.puzzle, solution: best!.solution };
}
