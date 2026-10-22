/**
 * Navigation Header adhering to the 3-Zone Top Bar Contract
 */
import React from 'react';
import { AlgorithmType } from '../types/graphics';
import { GraduationCap, FileDown } from 'lucide-react';

interface HeaderProps {
  currentAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  onOpenSynopsis: () => void;
  onExportSvg: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAlgorithm,
  onSelectAlgorithm,
  onOpenSynopsis,
  onExportSvg,
}) => {
  const algorithms: { id: AlgorithmType; label: string; shortLabel: string }[] = [
    { id: 'dda', label: 'DDA Line', shortLabel: 'DDA' },
    { id: 'bresenham', label: 'Bresenham Line', shortLabel: 'Bresenham' },
    { id: 'midpoint-line', label: 'Midpoint Line', shortLabel: 'Mid-Line' },
    { id: 'midpoint-circle', label: 'Midpoint Circle', shortLabel: 'Circle' },
    { id: 'cohen-sutherland', label: 'Cohen–Sutherland', shortLabel: 'Cohen' },
    { id: 'sutherland-hodgman', label: 'Sutherland–Hodgman', shortLabel: 'Hodgman' },
  ];

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
          <span className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
            <span className="hidden sm:inline">Graphics Algorithm Visualizer</span>
            <span className="sm:hidden">Graphics Algo</span>
          </span>
        </div>

        {/* Zone 2: Algorithm selector */}
        {/* Desktop segmented tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-x-auto max-w-2xl">
          {algorithms.map((algo) => {
            const isActive = currentAlgorithm === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() => onSelectAlgorithm(algo.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {algo.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile & Tablet Algorithm Selector */}
        <div className="lg:hidden flex-1 max-w-[160px] sm:max-w-[220px]">
          <select
            value={currentAlgorithm}
            onChange={(e) => onSelectAlgorithm(e.target.value as AlgorithmType)}
            className="w-full bg-slate-950 text-xs font-mono text-slate-200 border border-slate-700 rounded-md px-2 py-1.5 focus:outline-none focus:border-sky-500"
            aria-label="Select Graphics Algorithm"
          >
            {algorithms.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onExportSvg}
            title="Export current visualization as SVG vector graphic"
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0"
            aria-label="Export SVG"
          >
            <FileDown className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>

          <button
            onClick={onOpenSynopsis}
            title="View Project Synopsis & Team Credits"
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-sky-400 bg-sky-950/60 hover:bg-sky-900/60 active:bg-sky-900 border border-sky-800/60 rounded-lg flex items-center justify-center gap-1.5 transition-colors min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0"
            aria-label="Project Synopsis"
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Project Synopsis</span>
          </button>
        </div>
      </div>
    </header>
  );
};
