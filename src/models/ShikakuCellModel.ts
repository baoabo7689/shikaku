export type ShikakuColor = 'red' | 'blue' | 'green' | 'yellow' | 'black' | 'none';

export interface ShikakuCellModel {
  row: number;
  col: number;
  clue: number | null;
  color: ShikakuColor;
  isBlocked: boolean;

  setColor: (color: ShikakuColor) => ShikakuCellModel;
  setClue: (clue: number | null) => ShikakuCellModel;
  blockInit: () => ShikakuCellModel;
  reset: () => ShikakuCellModel;
}

export function createCell(row: number, col: number, clue: number | null = null): ShikakuCellModel {
  const cell: ShikakuCellModel = {
    row,
    col,
    clue,
    color: 'none',
    isBlocked: false,
    setColor: function (color) { return setCellColor(this, color); },
    setClue: function (c) { return setCellClue(this, c); },
    blockInit: function () { return blockCellInit(this); },
    reset: function () { return resetCell(this); },
  };
  return cell;
}

function setCellColor(cell: ShikakuCellModel, color: ShikakuColor): ShikakuCellModel {
  return { ...cell, color };
}

function setCellClue(cell: ShikakuCellModel, clue: number | null): ShikakuCellModel {
  return { ...cell, clue };
}

function blockCellInit(cell: ShikakuCellModel): ShikakuCellModel {
  if (cell.clue === null) return cell;
  return { ...cell, isBlocked: true };
}

function resetCell(cell: ShikakuCellModel): ShikakuCellModel {
  return { ...cell, color: 'none' };
}
