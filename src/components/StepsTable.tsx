/**
 * Tabular View of Algorithm Steps with Export (CSV / Clipboard)
 */
import React, { useState } from 'react';
import {
  AlgorithmType,
  DdaStep,
  BresenhamStep,
  MidpointLineStep,
  MidpointCircleStep,
  CohenSutherlandStep,
  SutherlandHodgmanStep,
} from '../types/graphics';
import { Download, Copy, Check, Table as TableIcon } from 'lucide-react';

interface StepsTableProps {
  algorithm: AlgorithmType;
  steps: any[];
  currentStep: number;
  onSelectStep: (stepIndex: number) => void;
}

export const StepsTable: React.FC<StepsTableProps> = ({
  algorithm,
  steps,
  currentStep,
  onSelectStep,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate CSV text
  const generateCSV = (): string => {
    if (steps.length === 0) return '';

    if (algorithm === 'dda') {
      const headers = ['Step', 'Float X', 'Float Y', 'Plot X', 'Plot Y', 'Explanation'];
      const rows = (steps as DdaStep[]).map((s) => [
        s.step,
        s.xFloat,
        s.yFloat,
        s.plotX,
        s.plotY,
        `"${s.explanation.replace(/"/g, '""')}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (algorithm === 'bresenham') {
      const headers = ['Step', 'X', 'Y', 'pk', 'next_pk', 'Chosen Pixel', 'Explanation'];
      const rows = (steps as BresenhamStep[]).map((s) => [
        s.step,
        s.x,
        s.y,
        s.pk,
        s.nextPk,
        `"${s.chosenPixel}"`,
        `"${s.explanation.replace(/"/g, '""')}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (algorithm === 'midpoint-line') {
      const headers = ['Step', 'X', 'Y', 'd', 'next_d', 'Chosen Pixel', 'Midpoint_X', 'Midpoint_Y', 'Explanation'];
      const rows = (steps as MidpointLineStep[]).map((s) => [
        s.step,
        s.x,
        s.y,
        s.d,
        s.nextD,
        `"${s.chosenPixel}"`,
        s.midpoint?.x,
        s.midpoint?.y,
        `"${s.explanation.replace(/"/g, '""')}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (algorithm === 'midpoint-circle') {
      const headers = ['Step', 'X', 'Y', 'pk', 'next_pk', 'Action', 'Octant1_Pixel'];
      const rows = (steps as MidpointCircleStep[]).map((s) => [
        s.step,
        s.x,
        s.y,
        s.pk,
        s.nextPk,
        s.action,
        `"(${s.points.octant1.x},${s.points.octant1.y})"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (algorithm === 'cohen-sutherland') {
      const headers = ['Step', 'P1', 'P2', 'Code1', 'Code2', 'Action', 'Intersection'];
      const rows = (steps as CohenSutherlandStep[]).map((s) => [
        s.step,
        `"(${s.p1.x},${s.p1.y})"`,
        `"(${s.p2.x},${s.p2.y})"`,
        s.code1Str,
        s.code2Str,
        s.action,
        s.intersection ? `"(${s.intersection.x},${s.intersection.y})"` : 'None',
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (algorithm === 'sutherland-hodgman') {
      const headers = ['Step', 'Stage', 'Edge', 'Case', 'Active_S', 'Active_P', 'Intersection', 'Out_Vertices_Count'];
      const rows = (steps as SutherlandHodgmanStep[]).map((s) => [
        s.step,
        s.stage,
        s.edgeName || '—',
        s.activePair?.caseType || '—',
        s.activePair ? `"(${s.activePair.s.x},${s.activePair.s.y})"` : '—',
        s.activePair ? `"(${s.activePair.p.x},${s.activePair.p.y})"` : '—',
        s.activePair?.intersection ? `"(${s.activePair.intersection.x},${s.activePair.intersection.y})"` : '—',
        s.outputVertices?.length ?? 0,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    return '';
  };

  const handleCopy = () => {
    const csv = generateCSV();
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${algorithm}_execution_steps.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col gap-3">
      {/* Table Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-sky-400 shrink-0" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Execution Steps Ledger
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            ({steps.length} rows)
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 rounded transition-colors min-h-[34px]"
            title="Copy table to clipboard as CSV"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy CSV'}</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700 rounded transition-colors min-h-[34px]"
            title="Download CSV file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Table Scroll Container */}
      <div className="max-h-[340px] overflow-y-auto overflow-x-auto rounded border border-slate-800">
        <table className="w-full text-left text-xs font-mono min-w-[500px]">
          <thead className="bg-slate-950 sticky top-0 text-slate-400 text-[11px] border-b border-slate-800">
            {algorithm === 'dda' && (
              <tr>
                <th className="py-2 px-3">k</th>
                <th className="py-2 px-3">Exact X</th>
                <th className="py-2 px-3">Exact Y</th>
                <th className="py-2 px-3">Plotted (X, Y)</th>
                <th className="py-2 px-3">Explanation</th>
              </tr>
            )}
            {algorithm === 'bresenham' && (
              <tr>
                <th className="py-2 px-3">k</th>
                <th className="py-2 px-3">Plotted (X, Y)</th>
                <th className="py-2 px-3">pk</th>
                <th className="py-2 px-3">Next pk+1</th>
                <th className="py-2 px-3">Choice</th>
                <th className="py-2 px-3">Explanation</th>
              </tr>
            )}
            {algorithm === 'midpoint-line' && (
              <tr>
                <th className="py-2 px-3">k</th>
                <th className="py-2 px-3">Plotted (X, Y)</th>
                <th className="py-2 px-3">d</th>
                <th className="py-2 px-3">Next d+1</th>
                <th className="py-2 px-3">Choice</th>
                <th className="py-2 px-3">Midpoint M</th>
                <th className="py-2 px-3">Explanation</th>
              </tr>
            )}
            {algorithm === 'midpoint-circle' && (
              <tr>
                <th className="py-2 px-3">k</th>
                <th className="py-2 px-3">Octant (X, Y)</th>
                <th className="py-2 px-3">pk</th>
                <th className="py-2 px-3">Next pk+1</th>
                <th className="py-2 px-3">Step Choice</th>
                <th className="py-2 px-3">Sample Symmetrical Pt</th>
              </tr>
            )}
            {algorithm === 'cohen-sutherland' && (
              <tr>
                <th className="py-2 px-3">Iter</th>
                <th className="py-2 px-3">P1 (X, Y)</th>
                <th className="py-2 px-3">Code 1</th>
                <th className="py-2 px-3">P2 (X, Y)</th>
                <th className="py-2 px-3">Code 2</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Intersection</th>
              </tr>
            )}
            {algorithm === 'sutherland-hodgman' && (
              <tr>
                <th className="py-2 px-3">Step</th>
                <th className="py-2 px-3">Clipping Edge</th>
                <th className="py-2 px-3">Case</th>
                <th className="py-2 px-3">Active S → P</th>
                <th className="py-2 px-3">Intersection</th>
                <th className="py-2 px-3">Vertices Out</th>
                <th className="py-2 px-3">Explanation</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-slate-850">
            {steps.map((row, idx) => {
              const isSelected = idx === currentStep;

              return (
                <tr
                  key={idx}
                  onClick={() => onSelectStep(idx)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-500/20 text-white font-semibold'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  {algorithm === 'dda' && (
                    <>
                      <td className="py-2 px-3 text-sky-400">{row.step}</td>
                      <td className="py-2 px-3">{row.xFloat}</td>
                      <td className="py-2 px-3">{row.yFloat}</td>
                      <td className="py-2 px-3 text-emerald-400">
                        [{row.plotX}, {row.plotY}]
                      </td>
                      <td className="py-2 px-3 text-slate-400 truncate max-w-[280px]">
                        {row.explanation}
                      </td>
                    </>
                  )}

                  {algorithm === 'bresenham' && (
                    <>
                      <td className="py-2 px-3 text-sky-400">{row.step}</td>
                      <td className="py-2 px-3 text-emerald-400">
                        [{row.x}, {row.y}]
                      </td>
                      <td className="py-2 px-3 font-semibold">{row.pk}</td>
                      <td className="py-2 px-3 text-slate-400">{row.nextPk}</td>
                      <td className="py-2 px-3 text-amber-300">{row.chosenPixel}</td>
                      <td className="py-2 px-3 text-slate-400 truncate max-w-[280px]">
                        {row.explanation}
                      </td>
                    </>
                  )}

                  {algorithm === 'midpoint-line' && (
                    <>
                      <td className="py-2 px-3 text-sky-400">{row.step}</td>
                      <td className="py-2 px-3 text-emerald-400">
                        [{row.x}, {row.y}]
                      </td>
                      <td className="py-2 px-3 font-semibold">{row.d}</td>
                      <td className="py-2 px-3 text-slate-400">{row.nextD}</td>
                      <td className="py-2 px-3 text-amber-300">{row.chosenPixel}</td>
                      <td className="py-2 px-3 text-slate-400">
                        ({row.midpoint?.x}, {row.midpoint?.y})
                      </td>
                      <td className="py-2 px-3 text-slate-400 truncate max-w-[240px]">
                        {row.explanation}
                      </td>
                    </>
                  )}

                  {algorithm === 'midpoint-circle' && (
                    <>
                      <td className="py-2 px-3 text-sky-400">{row.step}</td>
                      <td className="py-2 px-3 text-emerald-400">
                        [{row.x}, {row.y}]
                      </td>
                      <td className="py-2 px-3 font-semibold">{row.pk}</td>
                      <td className="py-2 px-3 text-slate-400">{row.nextPk}</td>
                      <td className="py-2 px-3 text-amber-300">{row.action}</td>
                      <td className="py-2 px-3 text-slate-400">
                        ({row.points?.octant1?.x}, {row.points?.octant1?.y})
                      </td>
                    </>
                  )}

                  {algorithm === 'cohen-sutherland' && (
                    <>
                      <td className="py-2 px-3 text-sky-400">{row.step}</td>
                      <td className="py-2 px-3">
                        ({row.p1?.x}, {row.p1?.y})
                      </td>
                      <td className="py-2 px-3 text-amber-300">{row.code1Str}</td>
                      <td className="py-2 px-3">
                        ({row.p2?.x}, {row.p2?.y})
                      </td>
                      <td className="py-2 px-3 text-amber-300">{row.code2Str}</td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">{row.action}</td>
                      <td className="py-2 px-3 text-slate-400">
                        {row.intersection ? `(${row.intersection.x}, ${row.intersection.y})` : '—'}
                      </td>
                    </>
                  )}

                  {algorithm === 'sutherland-hodgman' && (
                    <>
                      <td className="py-2 px-3 text-sky-400">{row.step}</td>
                      <td className="py-2 px-3 text-slate-200">{row.edgeName || row.stage}</td>
                      <td className="py-2 px-3 text-amber-300 font-semibold uppercase">{row.activePair?.caseType || '—'}</td>
                      <td className="py-2 px-3 text-slate-300">
                        {row.activePair ? `(${row.activePair.s.x},${row.activePair.s.y}) → (${row.activePair.p.x},${row.activePair.p.y})` : '—'}
                      </td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">
                        {row.activePair?.intersection ? `(${row.activePair.intersection.x}, ${row.activePair.intersection.y})` : '—'}
                      </td>
                      <td className="py-2 px-3 text-sky-300">
                        {row.outputVertices?.length ?? 0}
                      </td>
                      <td className="py-2 px-3 text-slate-400 truncate max-w-[240px]">
                        {row.explanation}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
