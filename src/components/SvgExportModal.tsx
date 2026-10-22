/**
 * SVG Export Modal with Live Preview and Customization Controls
 */
import React, { useState, useMemo } from 'react';
import { SvgExportOptions, generateAlgorithmSvg, downloadSvgFile } from '../utils/exportSvg';
import { X, Download, Copy, Check, FileCode, Sliders, Sun, Moon } from 'lucide-react';

interface SvgExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportOptions: Omit<SvgExportOptions, 'theme' | 'includeGrid' | 'includeAxes' | 'includeIdeal' | 'includeLabels' | 'includeBanner'>;
  defaultFilename?: string;
}

export const SvgExportModal: React.FC<SvgExportModalProps> = ({
  isOpen,
  onClose,
  exportOptions,
  defaultFilename = 'algorithm_path.svg',
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [includeGrid, setIncludeGrid] = useState<boolean>(true);
  const [includeAxes, setIncludeAxes] = useState<boolean>(true);
  const [includeIdeal, setIncludeIdeal] = useState<boolean>(true);
  const [includeLabels, setIncludeLabels] = useState<boolean>(true);
  const [includeBanner, setIncludeBanner] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate SVG on the fly
  const svgMarkup = useMemo(() => {
    return generateAlgorithmSvg({
      ...exportOptions,
      theme,
      includeGrid,
      includeAxes,
      includeIdeal,
      includeLabels,
      includeBanner,
    });
  }, [
    exportOptions,
    theme,
    includeGrid,
    includeAxes,
    includeIdeal,
    includeLabels,
    includeBanner,
  ]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const filename = defaultFilename.endsWith('.svg') ? defaultFilename : `${defaultFilename}.svg`;
    downloadSvgFile(svgMarkup, filename);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(svgMarkup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                Export Algorithm Path as SVG
              </h2>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Scalable Vector Graphics · For reports and slides
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split between Controls and Live Preview */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          {/* Left: Options & Settings (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-3.5 sm:gap-4">
            {/* Theme Toggle */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 sm:p-3.5 space-y-2">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                Visual Theme
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md text-xs font-medium border transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-sky-400 border-sky-500 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Blueprint
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md text-xs font-medium border transition-all ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 border-slate-300 shadow-sm font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Paper Light
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {theme === 'dark'
                  ? 'High-contrast neon styling for digital screens and slides.'
                  : 'Clean white background suitable for printouts and lab manuals.'}
              </p>
            </div>

            {/* Elements Included Checkboxes */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 sm:p-3.5 space-y-2.5">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                Graphic Elements
              </span>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeBanner}
                  onChange={(e) => setIncludeBanner(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                />
                <span>Title & Academic Header</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeIdeal}
                  onChange={(e) => setIncludeIdeal(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                />
                <span>Ideal Continuous Geometry Line/Circle</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeGrid}
                  onChange={(e) => setIncludeGrid(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                />
                <span>Coordinate Grid Lines</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeLabels}
                  onChange={(e) => setIncludeLabels(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                />
                <span>Coordinate Numbers & Point Labels</span>
              </label>
            </div>

            {/* Vector Specs Badge */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2.5 sm:p-3 text-[10px] sm:text-[11px] font-mono text-slate-400 space-y-1">
              <div>Format: Standalone SVG (XML)</div>
              <div>Renderer: Lossless Scalable Vector</div>
              <div>Compatibility: Inkscape, Illustrator, Word, LaTeX</div>
            </div>
          </div>

          {/* Right: Live Interactive Vector Preview (8 cols) */}
          <div className="md:col-span-8 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Live SVG Preview:</span>
              <span className="text-[11px] font-mono">Dynamically fits contents</span>
            </div>

            <div className="flex-1 min-h-[220px] max-h-[300px] sm:min-h-[340px] sm:max-h-[440px] overflow-auto rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center p-3 shadow-inner">
              {/* Inject SVG directly via dangerouslySetInnerHTML for perfect live preview */}
              <div
                className="max-w-full max-h-full flex items-center justify-center overflow-auto"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <button
            onClick={handleCopyCode}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 rounded-md transition-colors min-h-[38px]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'SVG Markup Copied!' : 'Copy SVG Markup'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors min-h-[38px]"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 rounded-md shadow-sm transition-all min-h-[38px]"
            >
              <Download className="w-4 h-4" />
              <span>Download .SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
