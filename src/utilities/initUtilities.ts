import { createEmptyGrid, ShikakuGridModel } from '@/models/ShikakuGridModel';

interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateTiling(rows: number, cols: number, maxArea: number): number[][] {
  const occupied = Array.from({ length: rows }, () => Array(cols).fill(-1));
  let groupId = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (occupied[r][c] !== -1) continue;

      const candidates: Rect[] = [];

      for (let h = 1; r + h - 1 < rows; h++) {
        let rowBlocked = false;
        for (let dc = 0; dc < 1; dc++) {
          if (occupied[r + h - 1][c + dc] !== -1) { rowBlocked = true; break; }
        }
        if (rowBlocked) break;

        for (let w = 1; c + w - 1 < cols; w++) {
          const area = h * w;

          let valid = true;
          outer: for (let dr = 0; dr < h; dr++) {
            for (let dc = 0; dc < w; dc++) {
              if (occupied[r + dr][c + dc] !== -1) { valid = false; break outer; }
            }
          }

          if (!valid) break;
          if (area > maxArea) break;
          if (area >= 2) candidates.push({ top: r, left: c, bottom: r + h - 1, right: c + w - 1 });
        }
      }

      const chosen = candidates.length > 0
        ? shuffle(candidates)[0]
        : { top: r, left: c, bottom: r, right: c };

      for (let dr = chosen.top; dr <= chosen.bottom; dr++) {
        for (let dc = chosen.left; dc <= chosen.right; dc++) {
          occupied[dr][dc] = groupId;
        }
      }
      groupId++;
    }
  }

  return occupied;
}

function tilingToGrid(tiling: number[][]): ShikakuGridModel {
  const rows = tiling.length;
  const cols = tiling[0].length;
  let grid = createEmptyGrid(rows, cols);

  const groupBounds = new Map<number, Rect>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gid = tiling[r][c];
      const existing = groupBounds.get(gid);
      if (!existing) {
        groupBounds.set(gid, { top: r, left: c, bottom: r, right: c });
      } else {
        existing.bottom = Math.max(existing.bottom, r);
        existing.right = Math.max(existing.right, c);
      }
    }
  }

  for (const [gid, rect] of groupBounds) {
    const area = (rect.bottom - rect.top + 1) * (rect.right - rect.left + 1);

    const cellsInRect: [number, number][] = [];
    for (let r = rect.top; r <= rect.bottom; r++) {
      for (let c = rect.left; c <= rect.right; c++) {
        if (tiling[r][c] === gid) cellsInRect.push([r, c]);
      }
    }

    const [clueRow, clueCol] = shuffle(cellsInRect)[0];
    grid = grid.setClue(clueRow, clueCol, area);
  }

  return grid.blockInit();
}

export const initUtilities = {
  random(rows: number, cols: number): ShikakuGridModel {
    const area = rows * cols;
    const maxArea = Math.max(2, Math.min(Math.floor(area / 6), 30));
    return tilingToGrid(generateTiling(rows, cols, maxArea));
  },
};
