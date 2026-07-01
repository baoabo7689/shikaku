'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { createEmptyGrid } from '@/models/ShikakuGridModel';
import { ShikakuColor } from '@/models/ShikakuCellModel';
import ShikakuGrid from '@/components/ShikakuGrid';
import ColorPalette from '@/components/ColorPalette';
import ImportComponent from '@/components/ImportComponent';
import { initUtilities } from '@/utilities/initUtilities';
import { ioUtilities } from '@/utilities/ioUtilities';
import { solveUtilities } from '@/utilities/solveUtilities';
import { ValidationIssue } from '@/utilities/validateUtilities';

export default function HomePage() {
  const { translations } = useLanguage();
  const [grid, setGrid] = useState(() => createEmptyGrid(10, 10));
  const [selectedColor, setSelectedColor] = useState<ShikakuColor>('red');
  const [message, setMessage] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [gridWidth, setGridWidth] = useState(10);
  const [gridHeight, setGridHeight] = useState(10);

  const formatIssue = (issue: ValidationIssue): string => {
    const t = translations.validation as Record<string, string>;
    const template = t[issue.type] ?? issue.type;
    return template
      .replace('{row}', String(issue.row))
      .replace('{col}', String(issue.col))
      .replace('{value}', String(issue.value ?? ''))
      .replace('{expected}', String(issue.expected ?? ''))
      .replace('{actual}', String(issue.actual ?? ''));
  };

  const getValidationMessage = (targetGrid = grid): string => {
    const issues = targetGrid.validate();
    if (issues.length === 0) return translations.validation.noErrors;
    return issues.map(formatIssue).join('\n');
  };

  useEffect(() => {
    setMessage(getValidationMessage());
  }, [translations]);

  const handleRandom = () => {
    const g = initUtilities.random(gridHeight, gridWidth);
    setGrid(g);
    setMessage(getValidationMessage(g));
  };

  const handleManual = () => {
    const g = createEmptyGrid(gridHeight, gridWidth);
    setGrid(g);
    setMessage('');
  };

  const handleImport = (rawValue: string): boolean => {
    const result = ioUtilities.importGrid(rawValue);
    if (!result.success) {
      setMessage(translations.interaction.importInvalidFormat);
      return false;
    }
    setGrid(result.grid);
    setMessage(translations.interaction.importLoaded);
    return true;
  };

  const handleBlockInit = () => {
    if (!grid.isBlockedInit) {
      const g = grid.blockInit();
      setGrid(g);
    }
  };

  const handleReset = () => {
    const g = grid.reset();
    setGrid(g);
    setMessage(getValidationMessage(g));
  };

  const handleValidate = () => {
    setMessage(getValidationMessage());
  };

  const handleExport = () => {
    setMessage(grid.export());
  };

  const handleSolve = () => {
    const hasClues = grid.cells.some(row => row.some(cell => cell.clue !== null));
    if (!hasClues) {
      setMessage(translations.interaction.noClues);
      return;
    }

    const solveTarget = grid.isBlockedInit ? grid : grid.blockInit();
    if (!grid.isBlockedInit) setGrid(solveTarget);

    const solved = solveUtilities.solve(solveTarget);
    if (solved === null) {
      setMessage(translations.interaction.noSolution);
    } else {
      setGrid(solved);
      setMessage(translations.interaction.solved);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100">
      {/* Init Section */}
      <section className="w-full bg-white border border-gray-200 shadow-sm pl-6 pt-3 pb-3">
        <div className="flex flex-col gap-2">
          {/* Row 1: size inputs */}
          <div className="flex items-center gap-3">
            <span className="label-interaction">
              <h2 className="text-xl font-bold tracking-tight">{translations.interaction.initTitle}</h2>
            </span>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              {translations.interaction.width}
              <input
                type="number"
                min={3} max={30}
                value={gridWidth}
                onChange={e => setGridWidth(Math.max(3, Math.min(30, parseInt(e.target.value) || 10)))}
                className="w-14 h-8 rounded border border-gray-300 text-center text-sm outline-none px-1"
              />
            </label>
            <span className="text-gray-500 font-medium">×</span>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              {translations.interaction.height}
              <input
                type="number"
                min={3} max={30}
                value={gridHeight}
                onChange={e => setGridHeight(Math.max(3, Math.min(30, parseInt(e.target.value) || 10)))}
                className="w-14 h-8 rounded border border-gray-300 text-center text-sm outline-none px-1"
              />
            </label>
          </div>
          {/* Row 2: action buttons */}
          <div className="flex items-center gap-3">
            <span className="label-interaction" />
            <button className="btn-interaction" onClick={handleRandom}>
              {translations.interaction.random}
            </button>
            <button className="btn-interaction" onClick={() => setIsImportOpen(true)}>
              {translations.interaction.import}
            </button>
            <button className="btn-interaction" onClick={handleManual}>
              {translations.interaction.manual}
            </button>
          </div>
        </div>
      </section>

      {/* Functional Section */}
      <section className="w-full bg-white border border-gray-200 shadow-sm pl-6 pt-3 pb-3">
        <div className="flex items-center gap-3">
          <span className="label-interaction">
            <h2 className="text-xl font-bold tracking-tight">{translations.interaction.functionalTitle}</h2>
          </span>
          <button className="btn-interaction" onClick={handleValidate}>
            {translations.interaction.validate}
          </button>
          <button className="btn-interaction" onClick={handleExport}>
            {translations.interaction.export}
          </button>
          <button className="btn-interaction" onClick={handleBlockInit} disabled={grid.isBlockedInit}>
            {translations.interaction.blockInit}
          </button>
          <button className="btn-interaction" onClick={handleSolve}>
            {translations.interaction.solve}
          </button>
        </div>
      </section>

      {/* Color Section */}
      <section className="w-full bg-white border border-gray-200 shadow-sm pl-6 pt-2 pb-2">
        <div className="flex items-center gap-3">
          <span className="label-interaction">
            <h2 className="text-xl font-bold tracking-tight">{translations.interaction.colorTitle}</h2>
          </span>
          <ColorPalette selected={selectedColor} onSelect={setSelectedColor} />
        </div>
      </section>

      {/* Grid + Message Section */}
      <section className="w-full bg-white border border-gray-200 shadow-sm" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 320px',
          gridTemplateRows: 'auto auto',
          columnGap: 32,
          rowGap: 4,
          marginTop: 24,
          marginBottom: 24,
          alignItems: 'start',
          width: 'fit-content',
        }}>
          {/* Row 1, Col 2 — heading only */}
          <div style={{ gridColumn: 2, gridRow: 1 }}>
            <h3 className="text-lg font-semibold">{translations.validation.messageTitle}</h3>
          </div>
          {/* Row 2, Col 1 — puzzle grid */}
          <div style={{ gridColumn: 1, gridRow: 2 }}>
            <ShikakuGrid grid={grid} setGrid={setGrid} selectedColor={selectedColor} />
          </div>
          {/* Row 2, Col 2 — message textarea */}
          <div style={{ gridColumn: 2, gridRow: 2 }}>
            <textarea
              className="w-full min-h-[260px] resize-y rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 outline-none"
              value={message}
              readOnly
              placeholder={translations.validation.messagePlaceholder}
            />
          </div>
        </div>
      </section>

      <ImportComponent
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onLoad={handleImport}
        translations={translations}
      />
    </main>
  );
}
