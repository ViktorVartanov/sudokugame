import { clsx, type ClassValue } from 'clsx';
import type { Board, CellState, Grid } from '../types/sudoku';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Formats a large aggregate duration (e.g. total time played) as "2h 15m" or "45m". */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}

export function createBoardFromPuzzle(puzzle: Grid): Board {
  return puzzle.map((row) =>
    row.map((value) => ({
      value,
      isGiven: value !== 0,
      notes: [],
      wasHinted: false,
    })),
  );
}

export function boardToValues(board: Board): Grid {
  return board.map((row) => row.map((cell) => cell.value));
}

export function isBoardSolved(board: Board, solution: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value !== solution[r][c]) return false;
    }
  }
  return true;
}

/** Returns the row/col/box peer coordinates for a given cell (excluding itself). */
export function getPeers(row: number, col: number): { row: number; col: number }[] {
  const peers: { row: number; col: number }[] = [];
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (i !== col) peers.push({ row, col: i });
    if (i !== row) peers.push({ row: i, col });
  }
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row || c !== col) peers.push({ row: r, col: c });
    }
  }
  return peers;
}

export function cloneCell(cell: CellState): CellState {
  return { ...cell, notes: [...cell.notes] };
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map(cloneCell));
}

/** Counts how many cells across the board correctly contain `digit`, out of 9 total. */
export function countCorrectlyPlaced(board: Board, solution: Grid, digit: number): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value === digit && solution[r][c] === digit) count++;
    }
  }
  return count;
}

export function getBoxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

export function getBoxCells(boxIndex: number): CellPositionLike[] {
  const boxRow = Math.floor(boxIndex / 3) * 3;
  const boxCol = (boxIndex % 3) * 3;
  const cells: CellPositionLike[] = [];
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      cells.push({ row: r, col: c });
    }
  }
  return cells;
}

interface CellPositionLike {
  row: number;
  col: number;
}

/** True when every cell in the given 3x3 box holds its correct solution digit. */
export function isBoxComplete(board: Board, solution: Grid, boxIndex: number): boolean {
  return getBoxCells(boxIndex).every(({ row, col }) => board[row][col].value === solution[row][col]);
}

/** Returns the indices (0-8) of every 3x3 box that is fully and correctly filled. */
export function getCompletedBoxes(board: Board, solution: Grid): number[] {
  const completed: number[] = [];
  for (let box = 0; box < 9; box++) {
    if (isBoxComplete(board, solution, box)) completed.push(box);
  }
  return completed;
}

export interface StarRatingInput {
  mistakes: number;
  hintsUsed: number;
}

/** Simple 1-3 star rating: fewer mistakes and hints earns more stars. */
export function calculateStars({ mistakes, hintsUsed }: StarRatingInput): number {
  if (mistakes === 0 && hintsUsed === 0) return 3;
  if (mistakes <= 2 && hintsUsed <= 1) return 2;
  return 1;
}
