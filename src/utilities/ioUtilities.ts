import { createEmptyGrid, ShikakuGridModel } from '@/models/ShikakuGridModel';

type ImportResult = { success: true; grid: ShikakuGridModel } | { success: false };

export const ioUtilities = {
  importGrid(rawValue: string): ImportResult {
    const lines = rawValue.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length < 2) return { success: false };

    const headerTokens = lines[0].split(/\s+/);
    if (headerTokens.length < 2) return { success: false };

    const rows = parseInt(headerTokens[0]);
    const cols = parseInt(headerTokens[1]);
    if (isNaN(rows) || isNaN(cols) || rows < 2 || cols < 2 || rows > 20 || cols > 20) {
      return { success: false };
    }

    if (lines.length < rows + 1) return { success: false };

    let grid = createEmptyGrid(rows, cols);

    for (let r = 0; r < rows; r++) {
      const tokens = lines[r + 1].split(/\s+/);
      if (tokens.length !== cols) return { success: false };

      for (let c = 0; c < cols; c++) {
        const token = tokens[c];
        if (token !== '_') {
          const num = parseInt(token);
          if (isNaN(num) || num < 1 || num > rows * cols) return { success: false };
          grid = grid.setClue(r, c, num);
        }
      }
    }

    return { success: true, grid: grid.blockInit() };
  },
};
