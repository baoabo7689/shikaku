import { ShikakuGridModel } from '@/models/ShikakuGridModel';
import { ShikakuColor } from '@/models/ShikakuCellModel';

interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface SolverClue {
  row: number;
  col: number;
  value: number;
  possibleRects: Rect[];
}

interface Assignment {
  row: number;
  col: number;
  rect: Rect;
  color: ShikakuColor;
}

const COLORS: ShikakuColor[] = ['red', 'blue', 'green', 'yellow'];

function getFactorPairs(n: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) pairs.push([i, n / i]);
  }
  return pairs;
}

function overlaps(a: Rect, b: Rect): boolean {
  return !(a.bottom < b.top || a.top > b.bottom || a.right < b.left || a.left > b.right);
}

function adjacent(a: Rect, b: Rect): boolean {
  return !(a.bottom < b.top - 1 || a.top > b.bottom + 1 || a.right < b.left - 1 || a.left > b.right + 1);
}

function greedyColor(assignments: Assignment[]): Assignment[] {
  const n = assignments.length;
  const adj: Set<number>[] = Array.from({ length: n }, () => new Set());
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (adjacent(assignments[i].rect, assignments[j].rect)) {
        adj[i].add(j);
        adj[j].add(i);
      }
    }
  }

  const colors: (ShikakuColor | null)[] = Array(n).fill(null);

  // DSatur + backtracking: picks the highest-saturation uncolored node at each step,
  // backtracks if no valid color exists (guarantees a solution for planar graphs).
  function colorStep(step: number): boolean {
    if (step === n) return true;

    // DSatur heuristic: pick uncolored node with most distinctly-colored neighbors
    let best = -1, bestSat = -1, bestDeg = -1;
    for (let i = 0; i < n; i++) {
      if (colors[i] !== null) continue;
      const sat = new Set(
        Array.from(adj[i]).map(j => colors[j]).filter((c): c is ShikakuColor => c !== null)
      ).size;
      const deg = adj[i].size;
      if (sat > bestSat || (sat === bestSat && deg > bestDeg)) {
        best = i; bestSat = sat; bestDeg = deg;
      }
    }

    const used = new Set(
      Array.from(adj[best]).map(j => colors[j]).filter((c): c is ShikakuColor => c !== null)
    );
    for (const color of COLORS) {
      if (!used.has(color)) {
        colors[best] = color;
        if (colorStep(step + 1)) return true;
        colors[best] = null;
      }
    }
    return false;
  }

  colorStep(0);
  return assignments.map((a, i) => ({ ...a, color: colors[i] ?? COLORS[i % 4] }));
}

// Corner/edge analysis: hintCells (black) act as hard walls — any rect that would
// cross a hint cell is immediately excluded, tightening each clue's domain.
function computePossibleRects(
  rows: number, cols: number,
  clueRow: number, clueCol: number,
  n: number,
  otherClues: Set<string>,
  hintCells: Set<string>
): Rect[] {
  const rects: Rect[] = [];

  for (const [w, h] of getFactorPairs(n)) {
    const topMin = Math.max(0, clueRow - h + 1);
    const topMax = Math.min(clueRow, rows - h);
    const leftMin = Math.max(0, clueCol - w + 1);
    const leftMax = Math.min(clueCol, cols - w);

    for (let top = topMin; top <= topMax; top++) {
      for (let left = leftMin; left <= leftMax; left++) {
        let invalid = false;
        outer: for (let r = top; r <= top + h - 1; r++) {
          for (let c = left; c <= left + w - 1; c++) {
            const key = `${r},${c}`;
            if ((r !== clueRow || c !== clueCol) && otherClues.has(key)) {
              invalid = true; break outer;
            }
            if (hintCells.has(key)) {
              invalid = true; break outer;
            }
          }
        }
        if (!invalid) {
          rects.push({ top, left, bottom: top + h - 1, right: left + w - 1 });
        }
      }
    }
  }

  return rects;
}

// Propagate forced assignments: any clue with exactly 1 possible rect gets assigned immediately.
function propagateForced(
  remaining: SolverClue[],
  assigned: Assignment[]
): { remaining: SolverClue[]; assigned: Assignment[] } | null {
  let rem = [...remaining];
  let asgn = [...assigned];
  let changed = true;

  while (changed) {
    changed = false;

    for (let i = 0; i < rem.length; i++) {
      if (rem[i].possibleRects.length === 0) return null;

      if (rem[i].possibleRects.length === 1) {
        const clue = rem[i];
        const rect = clue.possibleRects[0];

        if (asgn.some(a => overlaps(a.rect, rect))) return null;

        asgn = [...asgn, { row: clue.row, col: clue.col, rect, color: 'red' }];
        rem = rem.filter((_, j) => j !== i).map(c => ({
          ...c,
          possibleRects: c.possibleRects.filter(r => !overlaps(r, rect)),
        }));

        changed = true;
        break;
      }
    }
  }

  return { remaining: rem, assigned: asgn };
}

function backtrack(
  rows: number,
  cols: number,
  remaining: SolverClue[],
  assigned: Assignment[]
): Assignment[] | null {
  const propagated = propagateForced(remaining, assigned);
  if (propagated === null) return null;

  const { remaining: rem, assigned: asgn } = propagated;
  if (rem.length === 0) return asgn;

  // MRV: pick clue with fewest possible rects
  let minIdx = 0;
  for (let i = 1; i < rem.length; i++) {
    if (rem[i].possibleRects.length < rem[minIdx].possibleRects.length) minIdx = i;
  }

  const clue = rem[minIdx];
  const rest = rem.filter((_, i) => i !== minIdx);

  for (const rect of clue.possibleRects) {
    if (asgn.some(a => overlaps(a.rect, rect))) continue;

    const newRest = rest.map(c => ({
      ...c,
      possibleRects: c.possibleRects.filter(r => !overlaps(r, rect)),
    }));

    if (newRest.some(c => c.possibleRects.length === 0)) continue;

    const newAsgn = [...asgn, { row: clue.row, col: clue.col, rect, color: 'red' as ShikakuColor }];

    const result = backtrack(rows, cols, newRest, newAsgn);
    if (result !== null) return result;
  }

  return null;
}

export const solveUtilities = {
  solve(grid: ShikakuGridModel): ShikakuGridModel | null {
    // Collect hint cells (black = pre-solved regions); they act as hard walls.
    const hintCells = new Set<string>();
    for (let r = 0; r < grid.rows; r++)
      for (let c = 0; c < grid.cols; c++)
        if (grid.cells[r][c].color === 'black') hintCells.add(`${r},${c}`);

    const clues: SolverClue[] = [];
    const clueSet = new Set<string>();

    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const cell = grid.cells[r][c];
        if (cell.clue !== null) {
          clueSet.add(`${r},${c}`);
          // Skip clues inside hint regions — their rectangles are already given.
          if (!hintCells.has(`${r},${c}`)) {
            clues.push({ row: r, col: c, value: cell.clue, possibleRects: [] });
          }
        }
      }
    }

    if (clues.length === 0 && hintCells.size === 0) return null;

    // Corner/edge analysis: compute each clue's domain with hint walls applied.
    for (const clue of clues) {
      const others = new Set(clueSet);
      others.delete(`${clue.row},${clue.col}`);
      clue.possibleRects = computePossibleRects(
        grid.rows, grid.cols, clue.row, clue.col, clue.value, others, hintCells
      );
    }

    const result = backtrack(grid.rows, grid.cols, clues, []);
    if (result === null) return null;

    const colored = greedyColor(result);

    let newGrid = grid.reset();
    for (const { rect, color } of colored) {
      newGrid = newGrid.updateRect(rect.top, rect.left, rect.bottom, rect.right, color);
    }

    // Restore black hint cells (reset() cleared them).
    for (const key of hintCells) {
      const [r, c] = key.split(',').map(Number);
      newGrid = newGrid.updateCell(r, c, 'black');
    }

    return newGrid;
  },
};
