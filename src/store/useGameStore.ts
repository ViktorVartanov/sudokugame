import { create } from 'zustand';
import type { ActiveGameSnapshot, Board, CellPosition, ConflictHighlight, GameMessage, Grid } from '../types/sudoku';
import { generatePuzzle } from '../lib/sudokuGenerator';
import { mulberry32, generateSeed } from '../lib/seededRandom';
import { getDifficultyLevel } from '../lib/difficulty';
import {
  boardToValues,
  calculateStars,
  cloneBoard,
  createBoardFromPuzzle,
  getBoxIndex,
  getCompletedBoxes,
  getPeers,
  isBoardSolved,
  isBoxComplete,
} from '../lib/utils';
import {
  analyzeHint,
  describeBoxPosition,
  explainMistake,
  findEasyMoveHint,
  getBoxIndexForCell,
  type HintAnalysis,
} from '../lib/sudokuHints';
import { readStorage, removeStorage, writeStorage, STORAGE_KEYS } from '../lib/storage';
import { playCorrectSound, playWrongSound, playBoxCompleteSound, playVictorySound } from '../lib/sounds';
import type { Language } from '../lib/i18n';
import { useProgressStore } from './useProgressStore';
import { useAchievementsStore } from './useAchievementsStore';
import { useSettingsStore } from './useSettingsStore';

const COACH_COOLDOWN_MS = 20_000;
const COACH_TIP_CHANCE = 0.6;
const COACH_ENCOURAGEMENTS: Record<Language, string[]> = {
  ru: ['Хороший ход!', 'Так держать!', 'Отличная логика.', 'Уверенно идёшь к решению.'],
  en: ['Nice move!', 'Keep it up!', 'Great logic.', "You're cruising toward the solution."],
};
const COACH_BOX_COMPLETE_MESSAGE: Record<Language, string> = {
  ru: 'Отлично, этот блок завершён!',
  en: 'Nice, that box is complete!',
};
const COACH_EASY_MOVE_TEMPLATE: Record<Language, (position: string) => string> = {
  ru: (position) => `Посмотри на ${position} — там есть очевидный ход.`,
  en: (position) => `Check out the ${position} — there's an easy move there.`,
};

export const MAX_HINTS = 3;
const MAX_UNDO_STEPS = 50;
const SNAPSHOT_TICK_INTERVAL = 5;

interface CompletionResult {
  stars: number;
  isNewBestTime: boolean;
  newAchievements: string[];
}

export interface BattleContext {
  creatorUsername: string;
  creatorAvatarEmoji: string;
  creatorResult?: { timeSeconds: number; mistakes: number };
}

interface GameState {
  levelId: number | null;
  /** The seed the active puzzle was generated from — always set, even for "random" games, so any finished game can produce a reproducible "Beat My Score" challenge. */
  currentSeed: number;
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
  completedBoxes: number[];
  boxGlowIndex: number | null;
  boxGlowId: number;

  gameMessage: GameMessage | null;
  hintStage: number;
  hintAnalysis: HintAnalysis | null;
  conflictHighlight: ConflictHighlight | null;
  conflictHighlightId: number;
  lastCoachMessageAt: number;

  /** Set when the active game was started from a battle invite; drives the post-game comparison UI. */
  activeBattleContext: BattleContext | null;

  startNewGame: (levelId: number, seed?: number) => void;
  startBattleGame: (levelId: number, seed: number, context: BattleContext) => void;
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
  clearBoxGlow: () => void;
  dismissGameMessage: () => void;
  clearConflictHighlight: () => void;
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
    seed: state.currentSeed,
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

/**
 * Checks whether placing a digit at (row, col) just completed its 3x3 box
 * for the first time, and if so returns the fields needed to trigger a
 * one-shot glow animation for it (see Cell/GameBoard `boxGlowIndex` usage).
 * Returns `null` when nothing changed, so callers can skip the state update.
 */
function detectNewlyCompletedBox(
  board: Board,
  solution: Grid,
  completedBoxes: number[],
  row: number,
  col: number,
  boxGlowId: number,
): { completedBoxes: number[]; boxGlowIndex: number | null; boxGlowId: number } | null {
  const box = getBoxIndex(row, col);
  if (completedBoxes.includes(box)) return null;
  if (!isBoxComplete(board, solution, box)) return null;
  return { completedBoxes: [...completedBoxes, box], boxGlowIndex: box, boxGlowId: boxGlowId + 1 };
}

/** Prefers the currently selected cell if it's a valid hint target, else picks any empty/wrong cell. */
function findHintTarget(board: Board, solution: Grid, selected: CellPosition | null): CellPosition | null {
  const emptyOrWrong: CellPosition[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = board[r][c];
      if (!cell.isGiven && cell.value !== solution[r][c]) emptyOrWrong.push({ row: r, col: c });
    }
  }
  if (emptyOrWrong.length === 0) return null;
  if (selected && emptyOrWrong.some((p) => p.row === selected.row && p.col === selected.col)) return selected;
  return emptyOrWrong[Math.floor(Math.random() * emptyOrWrong.length)];
}

/** Fills in the correct digit at `target` as a used hint, then checks for completion. Shared by both hint modes. */
function revealHint(set: (partial: Partial<GameState>) => void, get: () => GameState, target: CellPosition) {
  const state = get();
  const nextHistory = [...state.history, cloneBoard(state.board)].slice(-MAX_UNDO_STEPS);
  const board = cloneBoard(state.board);
  const digit = state.solution[target.row][target.col];
  board[target.row][target.col] = { value: digit, isGiven: false, notes: [], wasHinted: true };
  if (useSettingsStore.getState().notesAutoClean) {
    removeNoteFromPeers(board, target.row, target.col, digit);
  }

  const boxGlow = detectNewlyCompletedBox(board, state.solution, state.completedBoxes, target.row, target.col, state.boxGlowId);

  set({
    board,
    history: nextHistory,
    hintsUsed: state.hintsUsed + 1,
    selected: target,
    hintStage: 0,
    hintAnalysis: null,
    gameMessage: null,
    ...boxGlow,
  });

  if (isBoardSolved(board, state.solution)) {
    completeGame(set, get);
  } else {
    persistSnapshot(get());
  }
}

/**
 * Coach Mode feedback after a correct move: an immediate celebration when a
 * box was just completed (bypassing the cooldown, since that's naturally
 * infrequent), otherwise an occasional, cooldown-gated nudge toward an easy
 * move elsewhere on the board, or a plain encouragement if none is found.
 */
function maybeShowCoachMessage(
  set: (partial: Partial<GameState>) => void,
  get: () => GameState,
  justCompletedBoxIndex: number | null,
) {
  if (!useSettingsStore.getState().coachMode) return;
  const state = get();
  const now = Date.now();
  const language = useSettingsStore.getState().language;

  if (justCompletedBoxIndex !== null) {
    set({ gameMessage: { text: COACH_BOX_COMPLETE_MESSAGE[language], tone: 'coach' }, lastCoachMessageAt: now });
    return;
  }

  if (now - state.lastCoachMessageAt < COACH_COOLDOWN_MS) return;
  if (Math.random() > COACH_TIP_CHANCE) return;

  const easyMove = findEasyMoveHint(state.board, state.solution);
  const encouragements = COACH_ENCOURAGEMENTS[language];
  const text = easyMove
    ? COACH_EASY_MOVE_TEMPLATE[language](describeBoxPosition(getBoxIndexForCell(easyMove.row, easyMove.col), language))
    : encouragements[Math.floor(Math.random() * encouragements.length)];

  set({ gameMessage: { text, tone: 'coach' }, lastCoachMessageAt: now });
}

export const useGameStore = create<GameState>()((set, get) => ({
  levelId: null,
  currentSeed: 0,
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
  completedBoxes: [],
  boxGlowIndex: null,
  boxGlowId: 0,

  gameMessage: null,
  hintStage: 0,
  hintAnalysis: null,
  conflictHighlight: null,
  conflictHighlightId: 0,
  lastCoachMessageAt: 0,
  activeBattleContext: null,

  startNewGame: (levelId, seed) => {
    const actualSeed = seed ?? generateSeed();
    const level = getDifficultyLevel(levelId);
    const { puzzle, solution } = generatePuzzle(level.clues, mulberry32(actualSeed));
    const board = createBoardFromPuzzle(puzzle);

    set({
      levelId,
      currentSeed: actualSeed,
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
      completedBoxes: getCompletedBoxes(board, solution),
      boxGlowIndex: null,
      gameMessage: null,
      hintStage: 0,
      hintAnalysis: null,
      conflictHighlight: null,
      activeBattleContext: null,
    });
    persistSnapshot(get());
  },

  startBattleGame: (levelId, seed, context) => {
    get().startNewGame(levelId, seed);
    set({ activeBattleContext: context });
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
      currentSeed: snapshot.seed ?? generateSeed(),
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
      completedBoxes: getCompletedBoxes(board, snapshot.solution),
      boxGlowIndex: null,
      gameMessage: null,
      hintStage: 0,
      hintAnalysis: null,
      conflictHighlight: null,
      activeBattleContext: null,
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
    const previousValue = targetCell.value;
    targetCell.value = digit;
    targetCell.notes = [];

    let mistakes = state.mistakes;
    let mistakeFlashId = state.mistakeFlashId;
    let lastMistakeCell = state.lastMistakeCell;
    let gameMessage = state.gameMessage;
    let conflictHighlight = state.conflictHighlight;
    let conflictHighlightId = state.conflictHighlightId;
    let hintStage = state.hintStage;
    let hintAnalysis = state.hintAnalysis;

    if (!isCorrect) {
      // Re-entering the exact same wrong digit isn't a *new* mistake — only
      // count it when the value actually changed into a (still) wrong one.
      const isNewMistake = previousValue !== digit;
      if (isNewMistake) mistakes += 1;
      mistakeFlashId += 1;
      lastMistakeCell = { row, col };

      if (isNewMistake && useSettingsStore.getState().explainMistakes) {
        const explanation = explainMistake(board, state.solution, row, col, digit, useSettingsStore.getState().language);
        gameMessage = { text: explanation.message, tone: 'mistake' };
        hintStage = 0;
        hintAnalysis = null;
        if (explanation.highlight) {
          conflictHighlight = explanation.highlight;
          conflictHighlightId += 1;
        }
      }
    } else {
      if (useSettingsStore.getState().notesAutoClean) {
        removeNoteFromPeers(board, row, col, digit);
      }
      // Clear any stale mistake-flash reference to this cell now that it's
      // correct, so its error styling can never resurface.
      if (lastMistakeCell?.row === row && lastMistakeCell?.col === col) {
        lastMistakeCell = null;
      }
      // A correct entry resolves whatever hint session was in progress for it.
      if (hintAnalysis && hintAnalysis.target.row === row && hintAnalysis.target.col === col) {
        hintStage = 0;
        hintAnalysis = null;
        gameMessage = null;
      }
    }

    const boxGlow = isCorrect
      ? detectNewlyCompletedBox(board, state.solution, state.completedBoxes, row, col, state.boxGlowId)
      : null;

    set({
      board,
      history: nextHistory,
      mistakes,
      mistakeFlashId,
      lastMistakeCell,
      gameMessage,
      conflictHighlight,
      conflictHighlightId,
      hintStage,
      hintAnalysis,
      ...boxGlow,
    });

    if (useSettingsStore.getState().soundEffects) {
      if (!isCorrect) playWrongSound();
      else if (boxGlow?.boxGlowIndex != null) playBoxCompleteSound();
      else playCorrectSound();
    }

    if (isCorrect) {
      maybeShowCoachMessage(set, get, boxGlow?.boxGlowIndex ?? null);
    }

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

    const smartHints = useSettingsStore.getState().smartHints;

    if (!smartHints) {
      const target = findHintTarget(state.board, state.solution, state.selected);
      if (target) revealHint(set, get, target);
      return;
    }

    // Mid-flow: a hint session is already showing steps 1-3 for a locked target.
    if (state.hintStage > 0 && state.hintAnalysis) {
      if (state.hintStage >= 3) {
        revealHint(set, get, state.hintAnalysis.target);
      } else {
        const nextStage = state.hintStage + 1;
        const text =
          nextStage === 2 ? state.hintAnalysis.specificClue : state.hintAnalysis.logicExplanation;
        set({ hintStage: nextStage, gameMessage: { text, tone: 'hint' } });
      }
      return;
    }

    // Fresh hint session: pick a target and show the first, softest clue.
    const target = findHintTarget(state.board, state.solution, state.selected);
    if (!target) return;
    const analysis = analyzeHint(state.board, state.solution, target, useSettingsStore.getState().language);
    set({
      selected: target,
      hintStage: 1,
      hintAnalysis: analysis,
      gameMessage: { text: analysis.softClue, tone: 'hint' },
    });
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
    const board = createBoardFromPuzzle(puzzle);
    set({
      board,
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
      completedBoxes: getCompletedBoxes(board, state.solution),
      boxGlowIndex: null,
      gameMessage: null,
      hintStage: 0,
      hintAnalysis: null,
      conflictHighlight: null,
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

  clearBoxGlow: () => set({ boxGlowIndex: null }),

  dismissGameMessage: () => {
    const state = get();
    // Dismissing mid-hint cancels that hint session rather than just hiding the text.
    set({ gameMessage: null, hintStage: 0, hintAnalysis: state.hintStage > 0 ? null : state.hintAnalysis });
  },

  clearConflictHighlight: () => set({ conflictHighlight: null }),
}));

function completeGame(set: (partial: Partial<GameState>) => void, get: () => GameState) {
  const state = get();
  if (!state.levelId) return;

  if (useSettingsStore.getState().soundEffects) playVictorySound();

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
