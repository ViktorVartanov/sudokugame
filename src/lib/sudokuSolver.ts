import type { Grid } from '../types/sudoku';

const SIZE = 9;
const BOX_SIZE = 3;

const boxIndex = (row: number, col: number) =>
  Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE);

const bitFor = (digit: number) => 1 << (digit - 1);

/** Internal mutable solving state built from a starting grid. */
class SolverState {
  rows = new Uint16Array(SIZE);
  cols = new Uint16Array(SIZE);
  boxes = new Uint16Array(SIZE);
  grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid.map((row) => [...row]);
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const value = this.grid[r][c];
        if (value !== 0) {
          const bit = bitFor(value);
          this.rows[r] |= bit;
          this.cols[c] |= bit;
          this.boxes[boxIndex(r, c)] |= bit;
        }
      }
    }
  }

  candidatesFor(row: number, col: number): number {
    const used = this.rows[row] | this.cols[col] | this.boxes[boxIndex(row, col)];
    return ~used & 0x1ff;
  }

  place(row: number, col: number, digit: number) {
    const bit = bitFor(digit);
    this.grid[row][col] = digit;
    this.rows[row] |= bit;
    this.cols[col] |= bit;
    this.boxes[boxIndex(row, col)] |= bit;
  }

  remove(row: number, col: number, digit: number) {
    const bit = bitFor(digit);
    this.grid[row][col] = 0;
    this.rows[row] &= ~bit;
    this.cols[col] &= ~bit;
    this.boxes[boxIndex(row, col)] &= ~bit;
  }

  /** Finds the empty cell with the fewest legal candidates (MRV heuristic). */
  findBestEmptyCell(): { row: number; col: number; candidates: number; count: number } | null {
    let best: { row: number; col: number; candidates: number; count: number } | null = null;

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (this.grid[r][c] !== 0) continue;
        const candidates = this.candidatesFor(r, c);
        const count = popcount(candidates);
        if (count === 0) return { row: r, col: c, candidates, count };
        if (!best || count < best.count) {
          best = { row: r, col: c, candidates, count };
          if (count === 1) return best;
        }
      }
    }
    return best;
  }
}

function popcount(n: number): number {
  let count = 0;
  while (n) {
    n &= n - 1;
    count++;
  }
  return count;
}

function digitsFromMask(mask: number): number[] {
  const digits: number[] = [];
  for (let d = 1; d <= 9; d++) {
    if (mask & bitFor(d)) digits.push(d);
  }
  return digits;
}

/**
 * Counts solutions up to `limit`, stopping early once the limit is reached.
 * Used to verify a puzzle has exactly one solution during generation.
 */
export function countSolutions(grid: Grid, limit = 2): number {
  const state = new SolverState(grid);
  let found = 0;

  const step = (): boolean => {
    const cell = state.findBestEmptyCell();
    if (!cell) {
      found++;
      return found >= limit;
    }
    if (cell.count === 0) return false;

    for (const digit of digitsFromMask(cell.candidates)) {
      state.place(cell.row, cell.col, digit);
      const shouldStop = step();
      state.remove(cell.row, cell.col, digit);
      if (shouldStop) return true;
    }
    return false;
  };

  step();
  return found;
}

/** Solves a grid and returns the first solution found, or null if unsolvable. */
export function solveGrid(grid: Grid): Grid | null {
  const state = new SolverState(grid);

  const step = (): boolean => {
    const cell = state.findBestEmptyCell();
    if (!cell) return true;
    if (cell.count === 0) return false;

    for (const digit of digitsFromMask(cell.candidates)) {
      state.place(cell.row, cell.col, digit);
      if (step()) return true;
      state.remove(cell.row, cell.col, digit);
    }
    return false;
  };

  return step() ? state.grid : null;
}

/** Generates a complete, randomly-shuffled, valid 9x9 solution grid. */
export function generateFullGrid(rng: () => number = Math.random): Grid {
  const empty: Grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  const state = new SolverState(empty);

  const shuffledDigits = () => {
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    return digits;
  };

  const step = (): boolean => {
    const cell = state.findBestEmptyCell();
    if (!cell) return true;
    if (cell.count === 0) return false;

    const candidateDigits = digitsFromMask(cell.candidates);
    for (const digit of shuffledDigits()) {
      if (!candidateDigits.includes(digit)) continue;
      state.place(cell.row, cell.col, digit);
      if (step()) return true;
      state.remove(cell.row, cell.col, digit);
    }
    return false;
  };

  step();
  return state.grid;
}

/** Checks whether a fully-filled grid follows all Sudoku rules. */
export function isGridValid(grid: Grid): boolean {
  const checkGroup = (values: number[]) => {
    const seen = new Set<number>();
    for (const value of values) {
      if (value === 0) continue;
      if (seen.has(value)) return false;
      seen.add(value);
    }
    return true;
  };

  for (let i = 0; i < SIZE; i++) {
    const row = grid[i];
    const col = grid.map((r) => r[i]);
    if (!checkGroup(row) || !checkGroup(col)) return false;
  }

  for (let boxRow = 0; boxRow < BOX_SIZE; boxRow++) {
    for (let boxCol = 0; boxCol < BOX_SIZE; boxCol++) {
      const box: number[] = [];
      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          box.push(grid[boxRow * BOX_SIZE + r][boxCol * BOX_SIZE + c]);
        }
      }
      if (!checkGroup(box)) return false;
    }
  }

  return true;
}
