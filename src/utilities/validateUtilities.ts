import type { ShikakuGridModel } from '@/models/ShikakuGridModel';

export type ValidationIssueType =
  | 'notRectangle'
  | 'noClue'
  | 'multipleClues'
  | 'wrongArea'
  | 'clueNotAssigned';

export interface ValidationIssue {
  type: ValidationIssueType;
  row: number;
  col: number;
  value?: number;
  expected?: number;
  actual?: number;
}

interface Group {
  cells: { row: number; col: number }[];
}

function findGroups(grid: ShikakuGridModel): Group[] {
  const visited = new Set<string>();
  const groups: Group[] = [];

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const cell = grid.cells[r][c];
      if (cell.color === 'none' || visited.has(`${r},${c}`)) continue;

      const group: Group = { cells: [] };
      const queue: { row: number; col: number }[] = [{ row: r, col: c }];
      visited.add(`${r},${c}`);

      while (queue.length > 0) {
        const { row: cr, col: cc } = queue.shift()!;
        group.cells.push({ row: cr, col: cc });

        const color = grid.cells[cr][cc].color;
        for (const [nr, nc] of [[cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]]) {
          const nkey = `${nr},${nc}`;
          if (
            nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols &&
            !visited.has(nkey) && grid.cells[nr][nc].color === color
          ) {
            visited.add(nkey);
            queue.push({ row: nr, col: nc });
          }
        }
      }

      groups.push(group);
    }
  }

  return groups;
}

function isRectangle(group: Group): boolean {
  if (group.cells.length === 0) return false;
  const minRow = Math.min(...group.cells.map(c => c.row));
  const maxRow = Math.max(...group.cells.map(c => c.row));
  const minCol = Math.min(...group.cells.map(c => c.col));
  const maxCol = Math.max(...group.cells.map(c => c.col));
  const expectedArea = (maxRow - minRow + 1) * (maxCol - minCol + 1);
  return group.cells.length === expectedArea;
}

export function validateGrid(grid: ShikakuGridModel): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const cell = grid.cells[r][c];
      if (cell.clue !== null && cell.color === 'none') {
        issues.push({ type: 'clueNotAssigned', row: r + 1, col: c + 1, value: cell.clue });
      }
    }
  }

  const groups = findGroups(grid);

  for (const group of groups) {
    if (!isRectangle(group)) {
      const first = group.cells[0];
      issues.push({ type: 'notRectangle', row: first.row + 1, col: first.col + 1 });
      continue;
    }

    const clueCells = group.cells.filter(cell => grid.cells[cell.row][cell.col].clue !== null);

    if (clueCells.length === 0) {
      issues.push({ type: 'noClue', row: group.cells[0].row + 1, col: group.cells[0].col + 1 });
    } else if (clueCells.length > 1) {
      const second = clueCells[1];
      issues.push({ type: 'multipleClues', row: second.row + 1, col: second.col + 1 });
    } else {
      const clueCell = clueCells[0];
      const expected = grid.cells[clueCell.row][clueCell.col].clue!;
      const actual = group.cells.length;
      if (actual !== expected) {
        issues.push({ type: 'wrongArea', row: clueCell.row + 1, col: clueCell.col + 1, expected, actual });
      }
    }
  }

  return issues;
}
