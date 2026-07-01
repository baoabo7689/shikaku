'use client';

import React, { useState } from 'react';
import { ShikakuGridModel } from '@/models/ShikakuGridModel';
import { ShikakuColor } from '@/models/ShikakuCellModel';

interface Props {
  grid: ShikakuGridModel;
  setGrid: (g: ShikakuGridModel) => void;
  selectedColor: ShikakuColor;
}

const COLOR_BG: Record<ShikakuColor, string> = {
  red: '#FCA5A5',
  blue: '#93C5FD',
  green: '#86EFAC',
  yellow: '#FDE047',
  black: '#374151',
  none: '#FFFFFF',
};

const PREVIEW_BG: Record<ShikakuColor, string> = {
  red: '#FEE2E2',
  blue: '#DBEAFE',
  green: '#DCFCE7',
  yellow: '#FEF9C3',
  black: '#6B7280',
  none: '#F3F4F6',
};

export default function ShikakuGrid({ grid, setGrid, selectedColor }: Props) {
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; col: number } | null>(null);

  const previewRect =
    dragStart && dragEnd
      ? {
          top: Math.min(dragStart.row, dragEnd.row),
          bottom: Math.max(dragStart.row, dragEnd.row),
          left: Math.min(dragStart.col, dragEnd.col),
          right: Math.max(dragStart.col, dragEnd.col),
        }
      : null;

  const isInPreview = (r: number, c: number) =>
    previewRect !== null &&
    r >= previewRect.top && r <= previewRect.bottom &&
    c >= previewRect.left && c <= previewRect.right;

  const handleMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!grid.isBlockedInit) return;
    setDragStart({ row, col });
    setDragEnd({ row, col });
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (dragStart) setDragEnd({ row, col });
  };

  const commitDrag = () => {
    if (dragStart && dragEnd) {
      const top = Math.min(dragStart.row, dragEnd.row);
      const bottom = Math.max(dragStart.row, dragEnd.row);
      const left = Math.min(dragStart.col, dragEnd.col);
      const right = Math.max(dragStart.col, dragEnd.col);
      setGrid(grid.updateRect(top, left, bottom, right, selectedColor));
    }
    setDragStart(null);
    setDragEnd(null);
  };

  return (
    <div
      className="inline-block select-none"
      style={{ border: '2px solid #374151' }}
      onMouseUp={commitDrag}
      onMouseLeave={commitDrag}
    >
      {Array.from({ length: grid.rows }, (_, r) => (
        <div key={r} style={{ display: 'flex' }}>
          {Array.from({ length: grid.cols }, (_, c) => {
            const cell = grid.cells[r][c];
            const inPrev = isInPreview(r, c);
            const bg = inPrev ? PREVIEW_BG[selectedColor] : COLOR_BG[cell.color];

            const rightNeighbor = c < grid.cols - 1 ? grid.cells[r][c + 1].color : null;
            const bottomNeighbor = r < grid.rows - 1 ? grid.cells[r + 1][c].color : null;

            const sameRight = rightNeighbor !== null && cell.color !== 'none' && rightNeighbor === cell.color;
            const sameBottom = bottomNeighbor !== null && cell.color !== 'none' && bottomNeighbor === cell.color;

            const borderRight = c < grid.cols - 1 ? (sameRight ? '1px solid #E5E7EB' : '1px solid #6B7280') : 'none';
            const borderBottom = r < grid.rows - 1 ? (sameBottom ? '1px solid #E5E7EB' : '1px solid #6B7280') : 'none';

            return (
              <div
                key={c}
                style={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bg,
                  borderRight,
                  borderBottom,
                  cursor: grid.isBlockedInit ? 'pointer' : 'default',
                  outline: inPrev ? '2px solid #2563EB' : undefined,
                  outlineOffset: inPrev ? '-2px' : undefined,
                  position: 'relative',
                  boxSizing: 'border-box',
                }}
                onMouseDown={e => handleMouseDown(r, c, e)}
                onMouseEnter={() => handleMouseEnter(r, c)}
              >
                {/* Manual mode: editable clue input */}
                {!grid.isBlockedInit ? (
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      height: '100%',
                      textAlign: 'center',
                      background: 'transparent',
                      outline: 'none',
                      border: 'none',
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: '#1F2937',
                    }}
                    maxLength={3}
                    value={cell.clue !== null ? String(cell.clue) : ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '') {
                        setGrid(grid.setClue(r, c, null));
                      } else {
                        const num = parseInt(val, 10);
                        if (!isNaN(num) && num > 0) setGrid(grid.setClue(r, c, num));
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: cell.clue !== null ? 11 : 9,
                      fontWeight: cell.clue !== null ? 'bold' : 'normal',
                      color: cell.clue !== null
                        ? (cell.color === 'black' ? '#FFFFFF' : '#1F2937')
                        : '#9CA3AF',
                      userSelect: 'none',
                    }}
                  >
                    {cell.clue !== null ? String(cell.clue) : ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
