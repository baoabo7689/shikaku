'use client';

import { ShikakuColor } from '@/models/ShikakuCellModel';

interface ColorOption {
  color: ShikakuColor;
  bg: string;
  label: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { color: 'none', bg: '#FFFFFF', label: 'No Color' },
  { color: 'red', bg: '#FCA5A5', label: 'Red' },
  { color: 'blue', bg: '#93C5FD', label: 'Blue' },
  { color: 'green', bg: '#86EFAC', label: 'Green' },
  { color: 'yellow', bg: '#FDE047', label: 'Yellow' },
  { color: 'black', bg: '#374151', label: 'Hint' },
];

interface Props {
  selected: ShikakuColor;
  onSelect: (color: ShikakuColor) => void;
}

export default function ColorPalette({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 items-center">
      {COLOR_OPTIONS.map(({ color, bg, label }) => (
        <button
          key={color}
          title={label}
          onClick={() => onSelect(color)}
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            backgroundColor: bg,
            border: selected === color ? '2px solid #1F2937' : '1px solid #9CA3AF',
            boxShadow: selected === color ? '0 0 0 1px #1F2937' : undefined,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1">
        {COLOR_OPTIONS.find(o => o.color === selected)?.label ?? 'No Color'}
      </span>
    </div>
  );
}
