import type { Board, CellPosition, Grid } from '../types/sudoku';
import type { Language } from './i18n';
import { getBoxIndex, getPeers } from './utils';

type UnitKind = 'row' | 'col' | 'box';

/** Unit name phrases per language. Russian needs case/gender agreement (строка is feminine, столбец/блок masculine). */
const UNIT_PHRASES: Record<Language, Record<UnitKind, { prepositional: string; genitive: string }>> = {
  ru: {
    row: { prepositional: 'в этой строке', genitive: 'этой строки' },
    col: { prepositional: 'в этом столбце', genitive: 'этого столбца' },
    box: { prepositional: 'в этом блоке 3×3', genitive: 'этого блока 3×3' },
  },
  en: {
    row: { prepositional: 'in this row', genitive: 'this row' },
    col: { prepositional: 'in this column', genitive: 'this column' },
    box: { prepositional: 'in this 3×3 box', genitive: 'this 3×3 box' },
  },
};

function formatDigitList(digits: number[], language: Language): string {
  const sorted = [...digits].sort((a, b) => a - b);
  if (sorted.length === 1) return String(sorted[0]);
  const and = language === 'ru' ? 'и' : 'and';
  return `${sorted.slice(0, -1).join(', ')} ${and} ${sorted[sorted.length - 1]}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Only trusts *correct* placements (given or correctly guessed) as "occupying" a digit for logic purposes. */
function effectiveValue(board: Board, solution: Grid, row: number, col: number): number {
  const cell = board[row][col];
  return cell.value !== 0 && cell.value === solution[row][col] ? cell.value : 0;
}

function unitCells(kind: UnitKind, row: number, col: number): CellPosition[] {
  if (kind === 'row') return Array.from({ length: 9 }, (_, c) => ({ row, col: c }));
  if (kind === 'col') return Array.from({ length: 9 }, (_, r) => ({ row: r, col }));
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  const cells: CellPosition[] = [];
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) cells.push({ row: r, col: c });
  }
  return cells;
}

function missingDigitsInUnit(board: Board, solution: Grid, kind: UnitKind, row: number, col: number): number[] {
  const present = new Set<number>();
  for (const cell of unitCells(kind, row, col)) {
    const value = effectiveValue(board, solution, cell.row, cell.col);
    if (value !== 0) present.add(value);
  }
  const missing: number[] = [];
  for (let d = 1; d <= 9; d++) if (!present.has(d)) missing.push(d);
  return missing;
}

/** Digits (1-9) that could still legally go in this cell, given only *correct* peer placements. */
export function getCandidates(board: Board, solution: Grid, row: number, col: number): number[] {
  const used = new Set<number>();
  for (const peer of getPeers(row, col)) {
    const value = effectiveValue(board, solution, peer.row, peer.col);
    if (value !== 0) used.add(value);
  }
  const candidates: number[] = [];
  for (let d = 1; d <= 9; d++) if (!used.has(d)) candidates.push(d);
  return candidates;
}

/** True if `digit` is a "hidden single" for this cell in `kind`: no other empty cell in the unit can take it. */
function isHiddenSingleInUnit(
  board: Board,
  solution: Grid,
  kind: UnitKind,
  row: number,
  col: number,
  digit: number,
): boolean {
  for (const cell of unitCells(kind, row, col)) {
    if (cell.row === row && cell.col === col) continue;
    const isEmpty = effectiveValue(board, solution, cell.row, cell.col) === 0;
    if (!isEmpty) continue;
    if (getCandidates(board, solution, cell.row, cell.col).includes(digit)) return false;
  }
  return true;
}

export type HintTechnique = 'naked-single' | 'hidden-single' | 'fallback';

export interface HintAnalysis {
  target: CellPosition;
  answer: number;
  technique: HintTechnique;
  /** Unit used for the "hidden single" explanation, when applicable. */
  hiddenSingleUnit?: UnitKind;
  softClue: string;
  specificClue: string;
  logicExplanation: string;
}

/** Picks the row/col/box (in that order of preference) with the fewest missing digits, for a punchier clue. */
function pickSpecificUnit(board: Board, solution: Grid, row: number, col: number): { kind: UnitKind; missing: number[] } {
  const options: { kind: UnitKind; missing: number[] }[] = (['row', 'col', 'box'] as UnitKind[]).map((kind) => ({
    kind,
    missing: missingDigitsInUnit(board, solution, kind, row, col),
  }));
  return options.reduce((best, current) => (current.missing.length < best.missing.length ? current : best));
}

/** Builds the full progressive hint explanation (soft clue -> specifics -> logic) for a target cell, in the given UI language. */
export function analyzeHint(board: Board, solution: Grid, target: CellPosition, language: Language): HintAnalysis {
  const { row, col } = target;
  const answer = solution[row][col];
  const candidates = getCandidates(board, solution, row, col);

  const softClue = language === 'ru' ? 'Посмотри на этот блок 3×3.' : 'Look at this 3×3 box.';
  const { kind: unitKind, missing } = pickSpecificUnit(board, solution, row, col);
  const unit = UNIT_PHRASES[language][unitKind];
  const digitList = formatDigitList(missing, language);
  const specificClue =
    language === 'ru'
      ? `${capitalize(unit.prepositional)} не хватает: ${digitList}.`
      : `${capitalize(unit.prepositional)}, you're missing: ${digitList}.`;

  if (candidates.length === 1) {
    return {
      target,
      answer,
      technique: 'naked-single',
      softClue,
      specificClue,
      logicExplanation:
        language === 'ru'
          ? `Все остальные цифры уже стоят в строке, столбце или блоке этой клетки — значит, здесь может быть только ${answer}.`
          : `Every other digit already occupies this cell's row, column, or box — so only ${answer} can go here.`,
    };
  }

  for (const kind of ['box', 'row', 'col'] as UnitKind[]) {
    if (isHiddenSingleInUnit(board, solution, kind, row, col, answer)) {
      const kindPhrases = UNIT_PHRASES[language][kind];
      return {
        target,
        answer,
        technique: 'hidden-single',
        hiddenSingleUnit: kind,
        softClue,
        specificClue,
        logicExplanation:
          language === 'ru'
            ? `Цифра ${answer} уже не помещается в другие свободные клетки ${kindPhrases.genitive} — значит, она может стоять только здесь.`
            : `The digit ${answer} no longer fits in any other free cell of ${kindPhrases.genitive} — so it can only go here.`,
      };
    }
  }

  return {
    target,
    answer,
    technique: 'fallback',
    softClue,
    specificClue,
    logicExplanation:
      language === 'ru'
        ? 'Это чуть более сложный случай — простой перебор по клеточкам здесь не даёт мгновенного ответа. Если хочешь, спроси подсказку ещё раз, и я покажу цифру.'
        : "This one's a bit trickier — simple elimination doesn't give an instant answer here. Ask for a hint again if you'd like me to reveal it.",
  };
}

export interface MistakeExplanation {
  message: string;
  highlight: { kind: UnitKind; row: number; col: number } | null;
}

/** Explains why `digit` is wrong at (row, col), preferring a concrete duplicate-conflict over a generic message. */
export function explainMistake(
  board: Board,
  solution: Grid,
  row: number,
  col: number,
  digit: number,
  language: Language,
): MistakeExplanation {
  for (const kind of ['row', 'col', 'box'] as UnitKind[]) {
    for (const cell of unitCells(kind, row, col)) {
      if (cell.row === row && cell.col === col) continue;
      if (effectiveValue(board, solution, cell.row, cell.col) === digit) {
        const unit = UNIT_PHRASES[language][kind];
        return {
          message:
            language === 'ru'
              ? `Эта ${digit} конфликтует с другой ${digit} ${unit.prepositional}.`
              : `This ${digit} conflicts with another ${digit} ${unit.prepositional}.`,
          highlight: { kind, row, col },
        };
      }
    }
  }
  return {
    message:
      language === 'ru'
        ? 'По решению здесь должна быть другая цифра — попробуй найти её сам.'
        : 'The solution needs a different digit here — try to find it yourself.',
    highlight: null,
  };
}

/** Finds any cell elsewhere on the board with an easy (naked/hidden single) move, for Coach Mode nudges. */
export function findEasyMoveHint(board: Board, solution: Grid): CellPosition | null {
  const candidates: CellPosition[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (effectiveValue(board, solution, r, c) !== 0) continue;
      candidates.push({ row: r, col: c });
    }
  }
  for (const { row, col } of candidates) {
    if (getCandidates(board, solution, row, col).length === 1) return { row, col };
  }
  for (const { row, col } of candidates) {
    const answer = solution[row][col];
    if (
      isHiddenSingleInUnit(board, solution, 'box', row, col, answer) ||
      isHiddenSingleInUnit(board, solution, 'row', row, col, answer) ||
      isHiddenSingleInUnit(board, solution, 'col', row, col, answer)
    ) {
      return { row, col };
    }
  }
  return null;
}

export function describeBoxPosition(boxIndex: number, language: Language): string {
  const boxRow = Math.floor(boxIndex / 3);
  const boxCol = boxIndex % 3;
  if (language === 'ru') {
    const vertical = ['верхний', 'средний', 'нижний'][boxRow];
    const horizontal = ['левый', 'центральный', 'правый'][boxCol];
    return `${vertical} ${horizontal} блок`;
  }
  const vertical = ['top', 'middle', 'bottom'][boxRow];
  const horizontal = ['left', 'center', 'right'][boxCol];
  return `${vertical}-${horizontal} box`;
}

export function getBoxIndexForCell(row: number, col: number): number {
  return getBoxIndex(row, col);
}
