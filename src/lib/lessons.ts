/**
 * Sudoku solving-technique curriculum. Every example/practice board below is
 * a small, hand-verified snapshot — not a full valid 81-cell puzzle. Only
 * the cells relevant to the technique are populated (as a `given` digit or
 * a candidate list); everything else renders blank, since a real board's
 * untouched cells would just be visual noise around the pattern being
 * taught. Within each populated unit (the row/column/box actually shown),
 * digits are fully consistent — no repeated givens, and every candidate
 * list is a subset of that unit's still-needed digits — so the deduction
 * being taught is real, checkable logic, not decoration.
 */

export type CellPos = [row: number, col: number];

export interface LessonCell {
  row: number;
  col: number;
  given?: number;
  candidates?: number[];
}

export interface LessonBoard {
  cells: LessonCell[];
  /** The cells that form the pattern itself (e.g. the naked pair, the X-Wing corners). */
  patternCells: CellPos[];
  /** The cell(s) the deduction applies to — highlighted in a different color than the pattern. */
  targetCells: CellPos[];
}

export interface TechniqueLesson {
  id: string;
  icon: string;
  example: LessonBoard;
  practice: LessonBoard & {
    /** Cell(s) the player must click to pass — same set as `targetCells`, kept separate since a lesson could in principle test a different cell than it highlights. */
    correctCells: CellPos[];
  };
}

export const LESSONS: TechniqueLesson[] = [
  {
    id: 'naked-single',
    icon: 'Target',
    example: {
      cells: [
        { row: 3, col: 3, given: 2 },
        { row: 3, col: 4, candidates: [4] },
        { row: 3, col: 5, given: 6 },
        { row: 4, col: 3, candidates: [5, 7, 9] },
        { row: 4, col: 4, given: 1 },
        { row: 4, col: 5, candidates: [5, 9] },
        { row: 5, col: 3, given: 8 },
        { row: 5, col: 4, candidates: [5, 7] },
        { row: 5, col: 5, given: 3 },
      ],
      patternCells: [[3, 4]],
      targetCells: [[3, 4]],
    },
    practice: {
      cells: [
        { row: 0, col: 0, given: 5 },
        { row: 0, col: 1, candidates: [3, 8] },
        { row: 0, col: 2, given: 9 },
        { row: 1, col: 0, candidates: [2] },
        { row: 1, col: 1, given: 6 },
        { row: 1, col: 2, candidates: [3, 8] },
        { row: 2, col: 0, given: 7 },
        { row: 2, col: 1, given: 1 },
        { row: 2, col: 2, candidates: [3, 4, 8] },
      ],
      patternCells: [],
      targetCells: [[1, 0]],
      correctCells: [[1, 0]],
    },
  },
  {
    id: 'hidden-single',
    icon: 'Search',
    example: {
      cells: [
        { row: 4, col: 0, given: 3 },
        { row: 4, col: 1, candidates: [2, 7, 9] },
        { row: 4, col: 2, given: 8 },
        { row: 4, col: 3, candidates: [2, 9] },
        { row: 4, col: 4, given: 1 },
        { row: 4, col: 5, given: 5 },
        { row: 4, col: 6, candidates: [2, 9] },
        { row: 4, col: 7, given: 6 },
        { row: 4, col: 8, given: 4 },
      ],
      patternCells: [
        [4, 1],
        [4, 3],
        [4, 6],
      ],
      targetCells: [[4, 1]],
    },
    practice: {
      cells: [
        { row: 0, col: 6, given: 1 },
        { row: 1, col: 6, candidates: [3, 5, 8] },
        { row: 2, col: 6, given: 6 },
        { row: 3, col: 6, candidates: [3, 8] },
        { row: 4, col: 6, given: 9 },
        { row: 5, col: 6, given: 2 },
        { row: 6, col: 6, given: 7 },
        { row: 7, col: 6, candidates: [3, 8] },
        { row: 8, col: 6, given: 4 },
      ],
      patternCells: [
        [1, 6],
        [3, 6],
        [7, 6],
      ],
      targetCells: [[1, 6]],
      correctCells: [[1, 6]],
    },
  },
  {
    id: 'naked-pair',
    icon: 'Copy',
    example: {
      cells: [
        { row: 6, col: 0, candidates: [4, 7] },
        { row: 6, col: 1, given: 5 },
        { row: 6, col: 2, candidates: [4, 7] },
        { row: 7, col: 0, given: 2 },
        { row: 7, col: 1, candidates: [1, 4, 7, 9] },
        { row: 7, col: 2, given: 8 },
        { row: 8, col: 0, given: 3 },
        { row: 8, col: 1, candidates: [1, 7, 9] },
        { row: 8, col: 2, given: 6 },
      ],
      patternCells: [
        [6, 0],
        [6, 2],
      ],
      targetCells: [[7, 1]],
    },
    practice: {
      cells: [
        { row: 2, col: 0, given: 9 },
        { row: 2, col: 1, candidates: [2, 5] },
        { row: 2, col: 2, given: 6 },
        { row: 2, col: 3, candidates: [1, 2, 5, 8] },
        { row: 2, col: 4, given: 3 },
        { row: 2, col: 5, candidates: [2, 5] },
        { row: 2, col: 6, given: 7 },
        { row: 2, col: 7, candidates: [1, 8] },
        { row: 2, col: 8, given: 4 },
      ],
      patternCells: [
        [2, 1],
        [2, 5],
      ],
      targetCells: [[2, 3]],
      correctCells: [[2, 3]],
    },
  },
  {
    id: 'pointing-pair',
    icon: 'ArrowRightFromLine',
    example: {
      cells: [
        { row: 0, col: 0, candidates: [3, 6] },
        { row: 0, col: 1, candidates: [3, 6, 9] },
        { row: 0, col: 2, given: 5 },
        { row: 1, col: 0, given: 2 },
        { row: 1, col: 1, candidates: [1, 4, 9] },
        { row: 1, col: 2, candidates: [1, 4] },
        { row: 2, col: 0, candidates: [1, 9] },
        { row: 2, col: 1, given: 7 },
        { row: 2, col: 2, given: 8 },
        { row: 0, col: 4, candidates: [2, 6, 8] },
      ],
      patternCells: [
        [0, 0],
        [0, 1],
      ],
      targetCells: [[0, 4]],
    },
    practice: {
      cells: [
        { row: 6, col: 6, given: 4 },
        { row: 6, col: 7, candidates: [3, 9] },
        { row: 6, col: 8, given: 2 },
        { row: 7, col: 6, candidates: [3, 6] },
        { row: 7, col: 7, candidates: [6, 9] },
        { row: 7, col: 8, candidates: [3, 7, 8] },
        { row: 8, col: 6, given: 5 },
        { row: 8, col: 7, candidates: [7, 9] },
        { row: 8, col: 8, given: 1 },
        { row: 3, col: 7, candidates: [2, 5, 9] },
      ],
      patternCells: [
        [6, 7],
        [7, 7],
        [8, 7],
      ],
      targetCells: [[3, 7]],
      correctCells: [[3, 7]],
    },
  },
  {
    id: 'hidden-pair',
    icon: 'Layers',
    example: {
      cells: [
        { row: 6, col: 0, given: 4 },
        { row: 6, col: 1, candidates: [2, 5, 9] },
        { row: 6, col: 2, candidates: [2, 3, 5, 7] },
        { row: 6, col: 3, given: 8 },
        { row: 6, col: 4, candidates: [2, 5, 9] },
        { row: 6, col: 5, given: 1 },
        { row: 6, col: 6, candidates: [3, 7, 9] },
        { row: 6, col: 7, candidates: [2, 5, 9] },
        { row: 6, col: 8, given: 6 },
      ],
      patternCells: [
        [6, 2],
        [6, 6],
      ],
      targetCells: [
        [6, 2],
        [6, 6],
      ],
    },
    practice: {
      cells: [
        { row: 0, col: 3, given: 6 },
        { row: 1, col: 3, candidates: [1, 3, 7] },
        { row: 2, col: 3, candidates: [1, 5, 7, 9] },
        { row: 3, col: 3, given: 8 },
        { row: 4, col: 3, candidates: [1, 3, 7] },
        { row: 5, col: 3, given: 2 },
        { row: 6, col: 3, candidates: [1, 3, 7] },
        { row: 7, col: 3, given: 4 },
        { row: 8, col: 3, candidates: [3, 5, 9] },
      ],
      patternCells: [
        [2, 3],
        [8, 3],
      ],
      targetCells: [
        [2, 3],
        [8, 3],
      ],
      correctCells: [
        [2, 3],
        [8, 3],
      ],
    },
  },
  {
    id: 'x-wing',
    icon: 'Grid2x2',
    example: {
      cells: [
        { row: 1, col: 2, candidates: [2, 5] },
        { row: 1, col: 6, candidates: [5, 8] },
        { row: 4, col: 2, candidates: [5, 9] },
        { row: 4, col: 6, candidates: [3, 5] },
        { row: 7, col: 2, candidates: [4, 5, 9] },
      ],
      patternCells: [
        [1, 2],
        [1, 6],
        [4, 2],
        [4, 6],
      ],
      targetCells: [[7, 2]],
    },
    practice: {
      cells: [
        { row: 2, col: 1, candidates: [3, 7] },
        { row: 2, col: 5, candidates: [7, 9] },
        { row: 6, col: 1, candidates: [7, 8] },
        { row: 6, col: 5, candidates: [1, 7] },
        { row: 8, col: 5, candidates: [2, 6, 7] },
      ],
      patternCells: [
        [2, 1],
        [2, 5],
        [6, 1],
        [6, 5],
      ],
      targetCells: [[8, 5]],
      correctCells: [[8, 5]],
    },
  },
];

export function getLesson(id: string): TechniqueLesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}
