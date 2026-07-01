import { ShikakuCellModel, ShikakuColor, createCell } from './ShikakuCellModel';
import { validateGrid, ValidationIssue } from '@/utilities/validateUtilities';

export interface ShikakuGridModel {
  cells: ShikakuCellModel[][];
  rows: number;
  cols: number;
  isBlockedInit: boolean;

  updateCell: (row: number, col: number, color: ShikakuColor) => ShikakuGridModel;
  updateRect: (top: number, left: number, bottom: number, right: number, color: ShikakuColor) => ShikakuGridModel;
  setClue: (row: number, col: number, clue: number | null) => ShikakuGridModel;
  blockInit: () => ShikakuGridModel;
  validate: () => ValidationIssue[];
  export: () => string;
  reset: () => ShikakuGridModel;
}

export function createEmptyGrid(rows: number, cols: number): ShikakuGridModel {
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => createCell(r, c))
  );
  return buildGrid(cells, rows, cols, false);
}

function buildGrid(cells: ShikakuCellModel[][], rows: number, cols: number, isBlockedInit: boolean): ShikakuGridModel {
  const grid: ShikakuGridModel = {
    cells,
    rows,
    cols,
    isBlockedInit,
    updateCell: function (r, c, color) { return gridUpdateCell(this, r, c, color); },
    updateRect: function (top, left, bottom, right, color) { return gridUpdateRect(this, top, left, bottom, right, color); },
    setClue: function (r, c, clue) { return gridSetClue(this, r, c, clue); },
    blockInit: function () { return gridBlockInit(this); },
    validate: function () { return validateGrid(this); },
    export: function () { return gridExport(this); },
    reset: function () { return gridReset(this); },
  };
  return grid;
}

function gridUpdateCell(grid: ShikakuGridModel, row: number, col: number, color: ShikakuColor): ShikakuGridModel {
  const newCells = grid.cells.map((rowArr, r) =>
    rowArr.map((cell, c) => r === row && c === col ? cell.setColor(color) : cell)
  );
  return buildGrid(newCells, grid.rows, grid.cols, grid.isBlockedInit);
}

function gridUpdateRect(
  grid: ShikakuGridModel,
  top: number, left: number, bottom: number, right: number,
  color: ShikakuColor
): ShikakuGridModel {
  const newCells = grid.cells.map((rowArr, r) =>
    rowArr.map((cell, c) =>
      r >= top && r <= bottom && c >= left && c <= right ? cell.setColor(color) : cell
    )
  );
  return buildGrid(newCells, grid.rows, grid.cols, grid.isBlockedInit);
}

function gridSetClue(grid: ShikakuGridModel, row: number, col: number, clue: number | null): ShikakuGridModel {
  const newCells = grid.cells.map((rowArr, r) =>
    rowArr.map((cell, c) => r === row && c === col ? cell.setClue(clue) : cell)
  );
  return buildGrid(newCells, grid.rows, grid.cols, grid.isBlockedInit);
}

function gridBlockInit(grid: ShikakuGridModel): ShikakuGridModel {
  const newCells = grid.cells.map(rowArr => rowArr.map(cell => cell.blockInit()));
  return buildGrid(newCells, grid.rows, grid.cols, true);
}

function gridReset(grid: ShikakuGridModel): ShikakuGridModel {
  const newCells = grid.cells.map(rowArr => rowArr.map(cell => cell.reset()));
  return buildGrid(newCells, grid.rows, grid.cols, grid.isBlockedInit);
}

function gridExport(grid: ShikakuGridModel): string {
  const lines: string[] = [`${grid.rows} ${grid.cols}`];
  for (let r = 0; r < grid.rows; r++) {
    lines.push(grid.cells[r].map(cell => cell.clue !== null ? String(cell.clue) : '_').join(' '));
  }
  return lines.join('\n');
}
