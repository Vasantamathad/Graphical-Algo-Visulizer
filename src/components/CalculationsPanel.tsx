/**
 * Intermediate Calculations, Decision Parameter Updates & Algorithm Pseudocode
 */
import React from 'react';
import {
  AlgorithmType,
  DdaStep,
  BresenhamStep,
  MidpointLineStep,
  MidpointCircleStep,
  CohenSutherlandStep,
  SutherlandHodgmanStep,
} from '../types/graphics';
import { DDA_PSEUDOCODE } from '../algorithms/dda';
import { BRESENHAM_PSEUDOCODE } from '../algorithms/bresenham';
import { MIDPOINT_LINE_PSEUDOCODE } from '../algorithms/midpointLine';
import { MIDPOINT_CIRCLE_PSEUDOCODE } from '../algorithms/midpointCircle';
import { COHEN_SUTHERLAND_PSEUDOCODE } from '../algorithms/cohenSutherland';
import { SUTHERLAND_HODGMAN_PSEUDOCODE } from '../algorithms/sutherlandHodgman';
import { Code, Calculator } from 'lucide-react';

interface CalculationsPanelProps {
  algorithm: AlgorithmType;
  currentStepData:
    | DdaStep
    | BresenhamStep
    | MidpointLineStep
    | MidpointCircleStep
    | CohenSutherlandStep
    | SutherlandHodgmanStep
    | null;
  metadata: any;
}

export const CalculationsPanel: React.FC<CalculationsPanelProps> = ({
  algorithm,
  currentStepData,
  metadata,
}) => {
  // Select active pseudocode lines based on algorithm
  const pseudocodeLines =
    algorithm === 'dda'
      ? DDA_PSEUDOCODE
      : algorithm === 'bresenham'
      ? BRESENHAM_PSEUDOCODE
      : algorithm === 'midpoint-line'
      ? MIDPOINT_LINE_PSEUDOCODE
      : algorithm === 'midpoint-circle'
      ? MIDPOINT_CIRCLE_PSEUDOCODE
      : algorithm === 'cohen-sutherland'
      ? COHEN_SUTHERLAND_PSEUDOCODE
      : algorithm === 'sutherland-hodgman'
      ? SUTHERLAND_HODGMAN_PSEUDOCODE
      : [];

  const activeLine = currentStepData?.codeLine ?? -1;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Current Step Explanation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Live Decision & Calculations
            </h3>
          </div>
          {currentStepData && (
            <span className="text-[11px] font-mono text-sky-400 bg-sky-950/70 border border-sky-800/60 px-2 py-0.5 rounded">
              Iteration k = {currentStepData.step}
            </span>
          )}
        </div>

        {currentStepData ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/80 p-2.5 rounded border border-slate-800/80">
              {currentStepData.explanation}
            </p>

            {/* Variable Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* DDA specific attributes */}
              {algorithm === 'dda' && (
                <>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Float (X, Y)</span>
                    <span className="text-xs font-mono font-medium text-amber-300">
                      ({(currentStepData as DdaStep).xFloat}, {(currentStepData as DdaStep).yFloat})
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Plotted Pixel</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      [{(currentStepData as DdaStep).plotX}, {(currentStepData as DdaStep).plotY}]
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Increment (dx/s, dy/s)</span>
                    <span className="text-xs font-mono text-slate-200">
                      ({metadata?.xInc}, {metadata?.yInc})
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Slope m</span>
                    <span className="text-xs font-mono text-slate-200">{metadata?.slope}</span>
                  </div>
                </>
              )}

              {/* Bresenham specific attributes */}
              {algorithm === 'bresenham' && (
                <>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Decision Param (pk)</span>
                    <span className={`text-xs font-mono font-semibold ${(currentStepData as BresenhamStep).pk < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {(currentStepData as BresenhamStep).pk}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Next (pk+1)</span>
                    <span className="text-xs font-mono font-semibold text-sky-400">
                      {(currentStepData as BresenhamStep).nextPk}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Chosen Pixel</span>
                    <span className="text-xs font-mono font-medium text-emerald-300">
                      {(currentStepData as BresenhamStep).chosenPixel}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Plotted (X, Y)</span>
                    <span className="text-xs font-mono font-semibold text-slate-100">
                      [{(currentStepData as BresenhamStep).x}, {(currentStepData as BresenhamStep).y}]
                    </span>
                  </div>
                </>
              )}

              {/* Midpoint Line specific attributes */}
              {algorithm === 'midpoint-line' && (
                <>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Decision Param (d)</span>
                    <span className={`text-xs font-mono font-semibold ${(currentStepData as MidpointLineStep).d < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {(currentStepData as MidpointLineStep).d}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Next (d+1)</span>
                    <span className="text-xs font-mono font-semibold text-sky-400">
                      {(currentStepData as MidpointLineStep).nextD}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Chosen Pixel</span>
                    <span className="text-xs font-mono font-medium text-emerald-300">
                      {(currentStepData as MidpointLineStep).chosenPixel}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Midpoint M(x, y)</span>
                    <span className="text-xs font-mono font-semibold text-slate-100">
                      ({(currentStepData as MidpointLineStep).midpoint?.x}, {(currentStepData as MidpointLineStep).midpoint?.y})
                    </span>
                  </div>
                </>
              )}

              {/* Midpoint Circle attributes */}
              {algorithm === 'midpoint-circle' && (
                <>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">pk (Decision)</span>
                    <span className={`text-xs font-mono font-semibold ${(currentStepData as MidpointCircleStep).pk < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {(currentStepData as MidpointCircleStep).pk}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Next pk+1</span>
                    <span className="text-xs font-mono font-semibold text-sky-400">
                      {(currentStepData as MidpointCircleStep).nextPk}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Candidate Action</span>
                    <span className="text-xs font-mono font-semibold text-pink-400">
                      {(currentStepData as MidpointCircleStep).action === 'E' ? 'E (y stays)' : 'SE (y - 1)'}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Primary Octant (X, Y)</span>
                    <span className="text-xs font-mono font-medium text-slate-100">
                      [{(currentStepData as MidpointCircleStep).x}, {(currentStepData as MidpointCircleStep).y}]
                    </span>
                  </div>
                </>
              )}

              {/* Cohen-Sutherland attributes */}
              {algorithm === 'cohen-sutherland' && (
                <>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Outcode P1</span>
                    <span className="text-xs font-mono font-semibold text-sky-400">
                      {(currentStepData as CohenSutherlandStep).code1Str}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Outcode P2</span>
                    <span className="text-xs font-mono font-semibold text-sky-400">
                      {(currentStepData as CohenSutherlandStep).code2Str}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Action</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      {(currentStepData as CohenSutherlandStep).action}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Intersection</span>
                    <span className="text-xs font-mono text-amber-300">
                      {(currentStepData as CohenSutherlandStep).intersection
                        ? `(${(currentStepData as CohenSutherlandStep).intersection?.x}, ${(currentStepData as CohenSutherlandStep).intersection?.y})`
                        : 'None'}
                    </span>
                  </div>
                </>
              )}

              {/* Sutherland-Hodgman Polygon attributes */}
              {algorithm === 'sutherland-hodgman' && (
                <>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Clipping Edge</span>
                    <span className="text-xs font-mono font-semibold text-sky-400">
                      {(currentStepData as SutherlandHodgmanStep).edgeName || (currentStepData as SutherlandHodgmanStep).stage}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Case Evaluation</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400 uppercase">
                      {(currentStepData as SutherlandHodgmanStep).activePair?.caseType || (currentStepData as SutherlandHodgmanStep).stage}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Active Edge (S → P)</span>
                    <span className="text-xs font-mono text-slate-200 truncate">
                      {(currentStepData as SutherlandHodgmanStep).activePair
                        ? `(${ (currentStepData as SutherlandHodgmanStep).activePair?.s.x},${ (currentStepData as SutherlandHodgmanStep).activePair?.s.y}) → (${ (currentStepData as SutherlandHodgmanStep).activePair?.p.x},${ (currentStepData as SutherlandHodgmanStep).activePair?.p.y})`
                        : '—'}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-mono">Intersection / New Vertices</span>
                    <span className="text-xs font-mono text-amber-300">
                      {(currentStepData as SutherlandHodgmanStep).activePair?.intersection
                        ? `I(${ (currentStepData as SutherlandHodgmanStep).activePair?.intersection?.x}, ${ (currentStepData as SutherlandHodgmanStep).activePair?.intersection?.y})`
                        : `${ (currentStepData as SutherlandHodgmanStep).outputVertices?.length ?? 0} out vertices`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No execution data for this step.</p>
        )}
      </div>

      {/* 2. Pseudocode Box with Active Line Highlighting */}
      {pseudocodeLines.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
            <Code className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Algorithm Pseudocode
            </h3>
          </div>
          <div className="font-mono text-[11px] leading-relaxed bg-slate-950/90 rounded p-2.5 overflow-x-auto border border-slate-800/60">
            {pseudocodeLines.map((line, idx) => {
              const lineNum = idx + 1;
              const isCurrent = lineNum === activeLine;
              return (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    isCurrent
                      ? 'bg-sky-500/20 text-sky-300 font-semibold border-l-2 border-sky-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
