/**
 * Parameter & Input Control Panel
 */
import React from 'react';
import {
  AlgorithmType,
  LineInputs,
  CircleInputs,
  ClippingInputs,
  PolygonInputs,
  Point2D,
} from '../types/graphics';
import {
  LINE_PRESETS,
  CIRCLE_PRESETS,
  CLIPPING_PRESETS,
  POLYGON_PRESETS,
} from '../data/presets';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';

interface ControlPanelProps {
  algorithm: AlgorithmType;
  lineInputs: LineInputs;
  circleInputs: CircleInputs;
  clippingInputs: ClippingInputs;
  polygonInputs?: PolygonInputs;
  onLineChange: (inputs: LineInputs) => void;
  onCircleChange: (inputs: CircleInputs) => void;
  onClippingChange: (inputs: ClippingInputs) => void;
  onPolygonChange?: (inputs: PolygonInputs) => void;
  onResetToDefaults: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  algorithm,
  lineInputs,
  circleInputs,
  clippingInputs,
  polygonInputs,
  onLineChange,
  onCircleChange,
  onClippingChange,
  onPolygonChange,
  onResetToDefaults,
}) => {
  const isLineAlgorithm =
    algorithm === 'dda' || algorithm === 'bresenham' || algorithm === 'midpoint-line';
  const isCircleAlgorithm = algorithm === 'midpoint-circle';
  const isLineClippingAlgorithm = algorithm === 'cohen-sutherland';
  const isPolygonAlgorithm = algorithm === 'sutherland-hodgman';

  // Handle Preset selection
  const handleLinePreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    if (!isNaN(idx) && LINE_PRESETS[idx]) {
      onLineChange(LINE_PRESETS[idx].data);
    }
  };

  const handleCirclePreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    if (!isNaN(idx) && CIRCLE_PRESETS[idx]) {
      onCircleChange(CIRCLE_PRESETS[idx].data);
    }
  };

  const handleClippingPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    if (!isNaN(idx) && CLIPPING_PRESETS[idx]) {
      onClippingChange(CLIPPING_PRESETS[idx].data);
    }
  };

  const handlePolygonPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    if (!isNaN(idx) && POLYGON_PRESETS[idx] && onPolygonChange) {
      onPolygonChange(POLYGON_PRESETS[idx].data);
    }
  };

  // Vertex management for polygon clipping
  const handleAddVertex = () => {
    if (!polygonInputs || !onPolygonChange) return;
    const lastV = polygonInputs.vertices[polygonInputs.vertices.length - 1] || { x: 5, y: 5 };
    const newVertices = [...polygonInputs.vertices, { x: lastV.x + 2, y: lastV.y + 1 }];
    onPolygonChange({ ...polygonInputs, vertices: newVertices });
  };

  const handleRemoveVertex = (index: number) => {
    if (!polygonInputs || !onPolygonChange || polygonInputs.vertices.length <= 3) return;
    const newVertices = polygonInputs.vertices.filter((_, i) => i !== index);
    onPolygonChange({ ...polygonInputs, vertices: newVertices });
  };

  const handleVertexChange = (index: number, key: 'x' | 'y', val: number) => {
    if (!polygonInputs || !onPolygonChange) return;
    const newVertices = polygonInputs.vertices.map((v, i) =>
      i === index ? { ...v, [key]: val } : v
    );
    onPolygonChange({ ...polygonInputs, vertices: newVertices });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col gap-3.5 sm:gap-4">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-2">
            Algorithm Input Parameters
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Configure coordinates or select an educational preset test case
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Preset selector dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              onChange={
                isLineAlgorithm
                  ? handleLinePreset
                  : isCircleAlgorithm
                  ? handleCirclePreset
                  : isPolygonAlgorithm
                  ? handlePolygonPreset
                  : handleClippingPreset
              }
              defaultValue=""
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-750 text-xs font-mono text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-sky-500 transition-colors min-h-[36px]"
              aria-label="Preset Cases"
            >
              <option value="" disabled>
                Select Preset Case...
              </option>
              {isLineAlgorithm &&
                LINE_PRESETS.map((p, i) => (
                  <option key={i} value={i}>
                    {p.name}
                  </option>
                ))}
              {isCircleAlgorithm &&
                CIRCLE_PRESETS.map((p, i) => (
                  <option key={i} value={i}>
                    {p.name}
                  </option>
                ))}
              {isPolygonAlgorithm &&
                POLYGON_PRESETS.map((p, i) => (
                  <option key={i} value={i}>
                    {p.name}
                  </option>
                ))}
              {isLineClippingAlgorithm &&
                CLIPPING_PRESETS.map((p, i) => (
                  <option key={i} value={i}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <button
            onClick={onResetToDefaults}
            title="Reset parameters to initial default"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors shrink-0"
            aria-label="Reset Parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Fields */}
      {isLineAlgorithm && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Start X (x1)</label>
            <input
              type="number"
              value={lineInputs.x1}
              onChange={(e) => onLineChange({ ...lineInputs, x1: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-2 sm:py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[38px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Start Y (y1)</label>
            <input
              type="number"
              value={lineInputs.y1}
              onChange={(e) => onLineChange({ ...lineInputs, y1: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-2 sm:py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[38px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">End X (x2)</label>
            <input
              type="number"
              value={lineInputs.x2}
              onChange={(e) => onLineChange({ ...lineInputs, x2: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-2 sm:py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[38px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">End Y (y2)</label>
            <input
              type="number"
              value={lineInputs.y2}
              onChange={(e) => onLineChange({ ...lineInputs, y2: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-2 sm:py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[38px]"
            />
          </div>
        </div>
      )}

      {isCircleAlgorithm && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Center X (xc)</label>
            <input
              type="number"
              value={circleInputs.xc}
              onChange={(e) => onCircleChange({ ...circleInputs, xc: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-2 sm:py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[38px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Center Y (yc)</label>
            <input
              type="number"
              value={circleInputs.yc}
              onChange={(e) => onCircleChange({ ...circleInputs, yc: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-2 sm:py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[38px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Radius (r ≥ 1)</label>
            <input
              type="number"
              min="1"
              max="40"
              value={circleInputs.r}
              onChange={(e) => onCircleChange({ ...circleInputs, r: Math.max(1, Number(e.target.value)) })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-2 sm:py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[38px]"
            />
          </div>
        </div>
      )}

      {isLineClippingAlgorithm && (
        <div className="space-y-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-sky-400 mb-1.5">
              Line Segment Coordinates
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">x1</label>
                <input
                  type="number"
                  value={clippingInputs.line.x1}
                  onChange={(e) =>
                    onClippingChange({
                      ...clippingInputs,
                      line: { ...clippingInputs.line, x1: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">y1</label>
                <input
                  type="number"
                  value={clippingInputs.line.y1}
                  onChange={(e) =>
                    onClippingChange({
                      ...clippingInputs,
                      line: { ...clippingInputs.line, y1: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">x2</label>
                <input
                  type="number"
                  value={clippingInputs.line.x2}
                  onChange={(e) =>
                    onClippingChange({
                      ...clippingInputs,
                      line: { ...clippingInputs.line, x2: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">y2</label>
                <input
                  type="number"
                  value={clippingInputs.line.y2}
                  onChange={(e) =>
                    onClippingChange({
                      ...clippingInputs,
                      line: { ...clippingInputs.line, y2: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-emerald-400 mb-1.5">
              Rectangular Clipping Window [Xmin, Xmax] × [Ymin, Ymax]
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">xmin</label>
                <input
                  type="number"
                  value={clippingInputs.window.xmin}
                  onChange={(e) =>
                    onClippingChange({
                      ...clippingInputs,
                      window: { ...clippingInputs.window, xmin: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">xmax</label>
                <input
                  type="number"
                  value={clippingInputs.window.xmax}
                  onChange={(e) =>
                    onClippingChange({
                      ...clippingInputs,
                      window: { ...clippingInputs.window, xmax: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">ymin</label>
                <input
                  type="number"
                  value={clippingInputs.window.ymin}
                  onChange={(e) =>
                    onClippingChange({
                      ...clippingInputs,
                      window: { ...clippingInputs.window, ymin: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">ymax</label>
                <input
                  type="number"
                  value={clippingInputs.window.ymax}
                  onChange={(e) =>
                    onClippingChange({
                      ...clippingInputs,
                      window: { ...clippingInputs.window, ymax: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isPolygonAlgorithm && polygonInputs && onPolygonChange && (
        <div className="space-y-3">
          {/* Rectangular window */}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-emerald-400 mb-1.5">
              Rectangular Clipping Window [Xmin, Xmax] × [Ymin, Ymax]
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">xmin</label>
                <input
                  type="number"
                  value={polygonInputs.window.xmin}
                  onChange={(e) =>
                    onPolygonChange({
                      ...polygonInputs,
                      window: { ...polygonInputs.window, xmin: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">xmax</label>
                <input
                  type="number"
                  value={polygonInputs.window.xmax}
                  onChange={(e) =>
                    onPolygonChange({
                      ...polygonInputs,
                      window: { ...polygonInputs.window, xmax: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">ymin</label>
                <input
                  type="number"
                  value={polygonInputs.window.ymin}
                  onChange={(e) =>
                    onPolygonChange({
                      ...polygonInputs,
                      window: { ...polygonInputs.window, ymin: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">ymax</label>
                <input
                  type="number"
                  value={polygonInputs.window.ymax}
                  onChange={(e) =>
                    onPolygonChange({
                      ...polygonInputs,
                      window: { ...polygonInputs.window, ymax: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-100 focus:outline-none focus:border-sky-500 min-h-[36px]"
                />
              </div>
            </div>
          </div>

          {/* Polygon Vertices Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider font-mono text-sky-400">
                Subject Polygon Vertices ({polygonInputs.vertices.length})
              </span>
              <button
                type="button"
                onClick={handleAddVertex}
                className="flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/60 rounded px-2 py-0.5 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Vertex</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/50 rounded border border-slate-800/70">
              {polygonInputs.vertices.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded"
                >
                  <span className="text-[10px] font-mono text-amber-400 w-5 text-center font-bold">
                    V{idx + 1}
                  </span>
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <input
                      type="number"
                      value={v.x}
                      onChange={(e) => handleVertexChange(idx, 'x', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded px-1.5 py-0.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500 text-center"
                      title={`Vertex ${idx + 1} X`}
                    />
                    <input
                      type="number"
                      value={v.y}
                      onChange={(e) => handleVertexChange(idx, 'y', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded px-1.5 py-0.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500 text-center"
                      title={`Vertex ${idx + 1} Y`}
                    />
                  </div>
                  {polygonInputs.vertices.length > 3 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVertex(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Vertex"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
