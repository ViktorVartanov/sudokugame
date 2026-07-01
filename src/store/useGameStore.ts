import { create } from 'zustand';
import type { ActiveGameSnapshot, Board, CellPosition, Grid } from '../types/sudoku';
import { generatePuzzle } from '../lib/sudokuGenerator';
import { getDifficultyLevel } from '../lib/difficulty';
import {
  boardToValues,
  calculateStars,
  cloneBoard,
  createBoardFromPuzzle,
  getPeers,
  isBoardSolved,
} from '../lib/utils';
import { readStorage, removeStorage, writeStorage, STORAGE_KEYS } from '../lib/storage';
import { useProgressStore } from './useProgressStore';
import { useAchievementsStore } from './useAchievementsStore';

export const MAX_HINTS = 3;
const MAX_UNDO_STEPS = 50;
const SNAPSHOT_TICK_INTERVAL = 5;

interface CompletionResult {
  stars: number;
  isNewBestTime: boolean;
  newAchievements: string[];
}

interface GameState {
  levelId: number | null;
  board: Board;
  solution: Grid;
  selected: CellPosition | null;
  notesMode: boolean;
  mistakes: number;
  hintsUsed: number;
  elapsedSeconds: number;
  isPaused: boolean;
  isComplete: boolean;
  startedAt: number;
  history: Board[];
  mistakeFlashId: number;
  lastMistakeCell: CellPosition | null;
  completion: CompletionResult | null;

  startNewGame: (levelId: number) => void;
  resumeSavedGame: () => boolean;
  discardSavedGame: () => void;
  getSavedLevelId: () => number | null;

  selectCell: (row: number, col: number) => void;
  inputNumber: (digit: number) => void;
  eraseSelectedCell: () => void;
  toggleNotesMode: () => void;
  useHint: () => void;
  undo: () => void;
  togglePause: () => void;
  restartPuzzle: () => void;
  tick: () => void;
}

function emptyBoard(): Board {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({ value: 0, isGiven: false, notes: [], wasHinted: false })),
  );
}

function persistSnapshot(state: GameState) {
  if (state.levelId === null) return;
  const snapshot: ActiveGameSnapshot = {
    levelId: state.levelId,
    puzzle: state.board.map((row) => row.map((cell) => (cell.isGiven ? cell.value : 0))),
    solution: state.solution,
    cells: state.board.map((row) =>
      row.map((cell) => ({
        value: cell.value,
        isGiven: cell.isGiven,
        notes: cell.notes,
        wasHinted: cell.wasHinted,
      })),
    ),
    mistakes: state.mistakes,
    hintsUsed: state.hintsUsed,
    elapsedSeconds: state.elapsedSeconds,
    notesMode: state.notesMode,
    isComplete: state.isComplete,
    startedAt: state.startedAt,
  };
  writeStorage(STORAGE_KEYS.activeGame, snapshot);
}

function removeNoteFromPeers(board: Board, row: number, col: number, digit: number) {
  for (const peer of getPeers(row, col)) {
    const cell = board[peer.row][peer.col];
    if (cell.notes.includes(digit)) {
      cell.notes = cell.notes.filter((n) => n !== digit);
    }
  }
}

export const useGameStore = create<GameState>()((set, get) => ({
  levelId: null,
  board: emptyBoard(),
  solution: emptyBoard().map((row) => row.map(() => 0)),
  selected: null,
  notesMode: false,
  mistakes: 0,
  hintsUsed: 0,
  elapsedSeconds: 0,
  isPaused: false,
  isComplete: false,
  startedAt: Date.now(),
  history: [],
  mistakeFlashId: 0,
  lastMistakeCell: null,
  completion: null,

  startNewGame: (levelId) => {
    const level = getDifficultyLevel(levelId);
    const { puzzle, solution } = generatePuzzle(level.clues);
    const board = createBoardFromPuzzle(puzzle);

    set({
      levelId,
      board,
      solution,
      selected: null,
      notesMode: false,
      mistakes: 0,
      hintsUsed: 0,
      elapsedSeconds: 0,
      isPaused: false,
      isComplete: false,
      startedAt: Date.now(),
      history: [],
      mistakeFlashId: 0,
      lastMistakeCell: null,
      completion: null,
    });
    persistSnapshot(get());
  },

  resumeSavedGame: () => {
    const snapshot = readStorage<ActiveGameSnapshot | null>(STORAGE_KEYS.activeGame, null);
    if (!snapshot || snapshot.isComplete) return false;

    const board: Board = snapshot.cells.map((row) =>
      row.map((cell) => ({
        value: cell.value,
        isGiven: cell.isGiven,
        notes: [...cell.notes],
        wasHinted: cell.wasHinted,
      })),
    );

    set({
      levelId: snapshot.levelId,
      board,
      solution: snapshot.solution,
      selected: null,
      notesMode: snapshot.notesMode,
      mistakes: snapshot.mistakes,
      hintsUsed: snapshot.hintsUsed,
      elapsedSeconds: snapshot.elapsedSeconds,
      isPaused: true,
      isComplete: false,
      startedAt: snapshot.startedAt,
      history: [],
      mistakeFlashId: 0,
      lastMistakeCell: null,
      completion: null,
    });
    return true;
  },

  discardSavedGame: () => removeStorage(STORAGE_KEYS.activeGame),

  getSavedLevelId: () => {
    const snapshot = readStorage<ActiveGameSnapshot | null>(STORAGE_KEYS.activeGame, null);
    if (!snapshot || snapshot.isComplete) return null;
    return snapshot.levelId;
  },

  selectCell: (row, col) => {
    if (get().isPaused || get().isComplete) return;
    set({ selected: { row, col } });
  },

  inputNumber: (digit) => {
    const state = get();
    if (state.isPaused || state.isComplete || !state.selected) return;
    const { row, col } = state.selected;
    const cell = state.board[row][col];
    if (cell.isGiven) return;

    const nextHistory = [...state.history, cloneBoard(state.board)].slice(-MAX_UNDO_STEPS);
    const board = cloneBoard(state.board);
    const targetCell = board[row][col];

    if (state.notesMode) {
      if (targetCell.value !== 0) return;
      targetCell.notes = targetCell.notes.includes(digit)
        ? targetCell.notes.filter((n) => n !== digit)
        : [...targetCell.notes, digit].sort((a, b) => a - b);
      set({ board, history: nextHistory });
      persistSnapshot(get());
      return;
    }

    const isCorrect = state.solution[row][col] === digit;
    targetCell.value = digit;
    targetCell.notes = [];

    let mistakes = state.mistakes;
    let mistakeFlashId = state.mistakeFlashId;
    let lastMistakeCell = state.lastMistakeCell;

    if (!isCorrect) {
      mistakes += 1;
      mistakeFlashId += 1;
      lastMistakeCell = { row, col };
    } else {
      removeNoteFromPeers(board, row, col, digit);
    }

    set({ board, history: nextHistory, mistakes, mistakeFlashId, lastMistakeCell });

    if (isBoardSolved(board, state.solution)) {
      completeGame(set, get);
    } else {
      persistSnapshot(get());
    }
  },

  eraseSelectedCell: () => {
    const state = get();
    if (state.isPaused || state.isComplete || !state.selected) return;
    const { row, col } = state.selected;
    const cell = state.board[row][col];
    if (cell.isGiven || (cell.value === 0 && cell.notes.length === 0)) return;

    const nextHistory = [...state.history, cloneBoard(state.board)].slice(-MAX_UNDO_STEPS);
    const board = cloneBoard(state.board);
    board[row][col] = { ...board[row][col], value: 0, notes: [] };
    set({ board, history: nextHistory });
    persistSnapshot(get());
  },

  toggleNotesMode: () => {
    set((state) => ({ notesMode: !state.notesMode }));
    persistSnapshot(get());
  },

  useHint: () => {
    const state = get();
    if (state.isPaused || state.isComplete || state.hintsUsed >= MAX_HINTS) return;

    const emptyOrWrong: CellPosition[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = state.board[r][c];
        if (!cell.isGiven && cell.value !== state.solution[r][c]) {
          emptyOrWrong.push({ row: r, col: c });
        }
      }
    }
    if (emptyOrWrong.length === 0) return;

    const target =
      state.selected && emptyOrWrong.some((p) => p.row === state.selected!.row && p.col === state.selected!.col)
        ? state.selected
        : emptyOrWrong[Math.floor(Math.random() * emptyOrWrong.length)];

    const nextHistory = [...state.history, cloneBoard(state.board)].slice(-MAX_UNDO_STEPS);
    const board = cloneBoard(state.board);
    const digit = state.solution[target.row][target.col];
    board[target.row][target.col] = { value: digit, isGiven: false, notes: [], wasHinted: true };
    removeNoteFromPeers(board, target.row, target.col, digit);

    set({
      board,
      history: nextHistory,
      hintsUsed: state.hintsUsed + 1,
      selected: target,
    });

    if (isBoardSolved(board, state.solution)) {
      completeGame(set, get);
    } else {
      persistSnapshot(get());
    }
  },

  undo: () => {
    const state = get();
    if (state.isPaused || state.isComplete || state.history.length === 0) return;
    const previous = state.history[state.history.length - 1];
    set({ board: previous, history: state.history.slice(0, -1) });
    persistSnapshot(get());
  },

  togglePause: () => {
    const state = get();
    if (state.isComplete) return;
    set({ isPaused: !state.isPaused });
    persistSnapshot(get());
  },

  restartPuzzle: () => {
    const state = get();
    if (!state.levelId) return;
    const puzzle = boardToValues(state.board).map((row, r) =>
      row.map((_, c) => (state.board[r][c].isGiven ? state.board[r][c].value : 0)),
    );
    set({
      board: createBoardFromPuzzle(puzzle),
      selected: null,
      mistakes: 0,
      hintsUsed: 0,
      elapsedSeconds: 0,
      isPaused: false,
      isComplete: false,
      history: [],
      mistakeFlashId: 0,
      lastMistakeCell: null,
      completion: null,
      startedAt: Date.now(),
    });
    persistSnapshot(get());
  },

  tick: () => {
    const state = get();
    if (state.isPaused || state.isComplete || state.levelId === null) return;
    const elapsedSeconds = state.elapsedSeconds + 1;
    set({ elapsedSeconds });
    if (elapsedSeconds % SNAPSHOT_TICK_INTERVAL === 0) {
      persistSnapshot(get());
    }
  },
}));

function completeGame(set: (partial: Partial<GameState>) => void, get: () => GameState) {
  const state = get();
  if (!state.levelId) return;

  const stars = calculateStars({ mistakes: state.mistakes, hintsUsed: state.hintsUsed });
  const previousBest = useProgressStore.getState().getLevelProgress(state.levelId).bestTimeSeconds;
  const { allLevelsCompleted, totalWinsAfterThis } = useProgressStore.getState().recordWin({
    levelId: state.levelId,
    timeSeconds: state.elapsedSeconds,
    mistakes: state.mistakes,
    stars,
  });

  const newAchievements = useAchievementsStore.getState().checkForNewAchievements({
    levelId: state.levelId,
    isGrandmaster: getDifficultyLevel(state.levelId).key === 'grandmaster',
    elapsedSeconds: state.elapsedSeconds,
    mistakes: state.mistakes,
    hintsUsed: state.hintsUsed,
    isFirstWinEver: totalWinsAfterThis === 1,
    allLevelsCompleted,
    totalWinsAfterThis,
  });

  set({
    isComplete: true,
    selected: null,
    completion: {
      stars,
      isNewBestTime: previousBest === null || state.elapsedSeconds < previousBest,
      newAchievements,
    },
  });
  removeStorage(STORAGE_KEYS.activeGame);
}
