/**
 * Graphics Algorithm Visualizer
 * Chetan Business School - Master of Computer Application (MCA)
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  AlgorithmType,
  LineInputs,
  CircleInputs,
  ClippingInputs,
  PolygonInputs,
  Point2D,
} from './types/graphics';
import { runDDA } from './algorithms/dda';
import { runBresenham } from './algorithms/bresenham';
import { runMidpointLine } from './algorithms/midpointLine';
import { runMidpointCircle } from './algorithms/midpointCircle';
import { runCohenSutherland } from './algorithms/cohenSutherland';
import { runSutherlandHodgman } from './algorithms/sutherlandHodgman';
import { Header } from './components/Header';
import { GridCanvas } from './components/GridCanvas';
import { PlaybackBar } from './components/PlaybackBar';
import { ControlPanel } from './components/ControlPanel';
import { CalculationsPanel } from './components/CalculationsPanel';
import { StepsTable } from './components/StepsTable';
import { SynopsisModal } from './components/SynopsisModal';
import { SvgExportModal } from './components/SvgExportModal';
import { Info } from 'lucide-react';

export default function App() {
  // Current active algorithm
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('dda');

  // Input states
  const [lineInputs, setLineInputs] = useState<LineInputs>({
    x1: 2,
    y1: 2,
    x2: 8,
    y2: 5,
  });

  const [circleInputs, setCircleInputs] = useState<CircleInputs>({
    xc: 8,
    yc: 8,
    r: 6,
  });

  const [clippingInputs, setClippingInputs] = useState<ClippingInputs>({
    line: { x1: 1, y1: 4, x2: 15, y2: 12 },
    window: { xmin: 3, xmax: 11, ymin: 3, ymax: 9 },
  });

  const [polygonInputs, setPolygonInputs] = useState<PolygonInputs>({
    vertices: [
      { x: 1, y: 1 },
      { x: 7, y: 13 },
      { x: 13, y: 2 },
    ],
    window: { xmin: 3, xmax: 10, ymin: 3, ymax: 9 },
  });

  // Playback control states
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(500); // ms per step

  // Synopsis modal state
  const [isSynopsisOpen, setIsSynopsisOpen] = useState<boolean>(false);

  // SVG Export modal state
  const [isSvgModalOpen, setIsSvgModalOpen] = useState<boolean>(false);

  // Active sub-tab in right deck (Calculations / Table)
  const [activeDeckTab, setActiveDeckTab] = useState<'calculations' | 'table'>('calculations');

  // Mobile section view filter ('canvas' | 'controls' | 'all')
  const [mobileSection, setMobileSection] = useState<'canvas' | 'controls' | 'all'>('all');

  // Execute algorithm calculations
  const ddaResult = useMemo(() => runDDA(lineInputs), [lineInputs]);
  const bresenhamResult = useMemo(() => runBresenham(lineInputs), [lineInputs]);
  const midpointLineResult = useMemo(() => runMidpointLine(lineInputs), [lineInputs]);
  const circleResult = useMemo(() => runMidpointCircle(circleInputs), [circleInputs]);
  const cohenResult = useMemo(() => runCohenSutherland(clippingInputs), [clippingInputs]);
  const sutherlandHodgmanResult = useMemo(
    () => runSutherlandHodgman(polygonInputs),
    [polygonInputs]
  );

  // Determine active step sequence and metadata
  const { steps, totalSteps, metadata } = useMemo(() => {
    switch (algorithm) {
      case 'dda':
        return {
          steps: ddaResult.steps,
          totalSteps: ddaResult.steps.length,
          metadata: ddaResult.metadata,
        };
      case 'bresenham':
        return {
          steps: bresenhamResult.steps,
          totalSteps: bresenhamResult.steps.length,
          metadata: bresenhamResult.metadata,
        };
      case 'midpoint-line':
        return {
          steps: midpointLineResult.steps,
          totalSteps: midpointLineResult.steps.length,
          metadata: midpointLineResult.metadata,
        };
      case 'midpoint-circle':
        return {
          steps: circleResult.steps,
          totalSteps: circleResult.steps.length,
          metadata: circleResult.metadata,
        };
      case 'cohen-sutherland':
        return {
          steps: cohenResult.steps,
          totalSteps: cohenResult.steps.length,
          metadata: cohenResult.metadata,
        };
      case 'sutherland-hodgman':
        return {
          steps: sutherlandHodgmanResult.steps,
          totalSteps: sutherlandHodgmanResult.steps.length,
          metadata: sutherlandHodgmanResult.metadata,
        };
      default:
        return { steps: [], totalSteps: 0, metadata: {} };
    }
  }, [
    algorithm,
    ddaResult,
    bresenhamResult,
    midpointLineResult,
    circleResult,
    cohenResult,
    sutherlandHodgmanResult,
  ]);

  // Reset current step when switching algorithm or modifying input
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithm, lineInputs, circleInputs, clippingInputs, polygonInputs]);

  // Handle Playback Loop
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev + 1 >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, playbackSpeed]);

  // Keyboard Shortcuts (Space to play/pause, Arrow keys to step)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSteps]);

  // Current Step Data
  const currentStepData = steps[currentStep] || null;

  // Pixels to display on canvas up to current step
  const visiblePixels = useMemo<Point2D[]>(() => {
    if (algorithm === 'dda') {
      return ddaResult.pixels.slice(0, currentStep + 1);
    }
    if (algorithm === 'bresenham') {
      return bresenhamResult.pixels.slice(0, currentStep + 1);
    }
    if (algorithm === 'midpoint-line') {
      return midpointLineResult.pixels.slice(0, currentStep + 1);
    }
    if (algorithm === 'midpoint-circle') {
      // Aggregate all 8-way symmetric pixels up to current step
      const setMap = new Map<string, Point2D>();
      for (let i = 0; i <= currentStep && i < circleResult.steps.length; i++) {
        const step = circleResult.steps[i];
        if (step?.points) {
          Object.values(step.points).forEach((p) => setMap.set(`${p.x},${p.y}`, p));
        }
      }
      return Array.from(setMap.values());
    }
    return [];
  }, [algorithm, currentStep, ddaResult, bresenhamResult, midpointLineResult, circleResult]);

  // Active current pixel
  const activeCurrentPixel = useMemo<Point2D | null>(() => {
    if (algorithm === 'dda') {
      const s = ddaResult.steps[currentStep];
      return s ? { x: s.plotX, y: s.plotY } : null;
    }
    if (algorithm === 'bresenham') {
      const s = bresenhamResult.steps[currentStep];
      return s ? { x: s.x, y: s.y } : null;
    }
    if (algorithm === 'midpoint-line') {
      const s = midpointLineResult.steps[currentStep];
      return s ? { x: s.x, y: s.y } : null;
    }
    if (algorithm === 'midpoint-circle') {
      const s = circleResult.steps[currentStep];
      return s ? { x: circleInputs.xc + s.x, y: circleInputs.yc + s.y } : null;
    }
    return null;
  }, [algorithm, currentStep, ddaResult, bresenhamResult, midpointLineResult, circleResult, circleInputs]);

  // Circle octant points for current step
  const activeOctantPoints = useMemo(() => {
    if (algorithm === 'midpoint-circle' && circleResult.steps[currentStep]) {
      return circleResult.steps[currentStep].points;
    }
    return null;
  }, [algorithm, currentStep, circleResult]);

  // Line clipping visualization segments
  const clippingDisplay = useMemo(() => {
    if (algorithm === 'cohen-sutherland') {
      const step = cohenResult.steps[currentStep];
      const intersections: Point2D[] = [];
      cohenResult.steps.slice(0, currentStep + 1).forEach((s) => {
        if (s.intersection) intersections.push(s.intersection);
      });

      return {
        window: clippingInputs.window,
        original: {
          x1: clippingInputs.line.x1,
          y1: clippingInputs.line.y1,
          x2: clippingInputs.line.x2,
          y2: clippingInputs.line.y2,
        },
        clipped: step && (step.action === 'trivial-accept' || (currentStep === cohenResult.steps.length - 1 && cohenResult.isAccepted))
          ? {
              x1: step.p1.x,
              y1: step.p1.y,
              x2: step.p2.x,
              y2: step.p2.y,
            }
          : null,
        intersections,
      };
    }
    return null;
  }, [algorithm, currentStep, cohenResult, clippingInputs]);

  // Sutherland-Hodgman Polygon clipping visualization display
  const polygonDisplay = useMemo(() => {
    if (algorithm === 'sutherland-hodgman') {
      const s = sutherlandHodgmanResult.steps[currentStep];
      const isFinished = currentStep === sutherlandHodgmanResult.steps.length - 1 || s?.stage === 'finished';
      return {
        window: polygonInputs.window,
        original: polygonInputs.vertices,
        clipped: isFinished ? sutherlandHodgmanResult.clippedPolygon : (s?.outputVertices || []),
        activeEdge: s?.activePair ? { s: s.activePair.s, p: s.activePair.p } : null,
      };
    }
    return null;
  }, [algorithm, currentStep, sutherlandHodgmanResult, polygonInputs]);

  // Reset inputs
  const handleResetInputs = () => {
    setLineInputs({ x1: 2, y1: 2, x2: 8, y2: 5 });
    setCircleInputs({ xc: 8, yc: 8, r: 6 });
    setClippingInputs({
      line: { x1: 1, y1: 4, x2: 15, y2: 12 },
      window: { xmin: 3, xmax: 11, ymin: 3, ymax: 9 },
    });
    setPolygonInputs({
      vertices: [
        { x: 1, y: 1 },
        { x: 7, y: 13 },
        { x: 13, y: 2 },
      ],
      window: { xmin: 3, xmax: 10, ymin: 3, ymax: 9 },
    });
  };

  // Algorithm quick descriptions
  const algorithmDescriptions: Record<AlgorithmType, { title: string; desc: string; formula: string }> = {
    dda: {
      title: 'Digital Differential Analyzer (DDA)',
      desc: 'Generates line pixels by incrementing coordinates with floating-point Δx/steps and Δy/steps, rounding to nearest integer pixel.',
      formula: 'dx = x2 - x1, dy = y2 - y1, steps = max(|dx|, |dy|), x_inc = dx/steps, y_inc = dy/steps',
    },
    bresenham: {
      title: "Bresenham's Integer Line Algorithm",
      desc: 'Highly efficient rasterizer using integer decision parameter (pk) to choose nearest pixel without floating-point math.',
      formula: 'p0 = 2Δy - Δx; if pk < 0: pk+1 = pk + 2Δy; else: pk+1 = pk + 2Δy - 2Δx',
    },
    'midpoint-line': {
      title: 'Midpoint Line Drawing Algorithm',
      desc: 'Evaluates implicit line function F(x, y) = ax + by + c at midpoint between candidate pixels to determine closest raster path.',
      formula: 'd0 = 2Δy - Δx; if d < 0: select E, d = d + 2Δy; else: select NE, d = d + 2Δy - 2Δx',
    },
    'midpoint-circle': {
      title: 'Midpoint Circle Drawing Algorithm',
      desc: 'Rasterizes circular arc across octant 1 (x ≤ y) and reflects 8 symmetrical pixels across the coordinate plane.',
      formula: 'p0 = 1 - r; if pk < 0: pk+1 = pk + 2x + 1; else: pk+1 = pk + 2x - 2y + 1',
    },
    'cohen-sutherland': {
      title: 'Cohen–Sutherland Line Clipping',
      desc: 'Divides 2D plane into 9 regions using 4-bit Outcodes (TOP, BOTTOM, RIGHT, LEFT) with bitwise trivial accept/reject tests.',
      formula: 'code1 | code2 == 0 => Accept; code1 & code2 != 0 => Reject; else: intersect window boundary',
    },
    'sutherland-hodgman': {
      title: 'Sutherland–Hodgman Polygon Clipping',
      desc: 'Clips a subject polygon sequentially against each infinite edge of a convex window using 4 geometric vertex transition cases.',
      formula: 'In→In: save P | In→Out: save I | Out→Out: none | Out→In: save I, P',
    },
  };

  const currentInfo = algorithmDescriptions[algorithm];

  // SVG Export metadata and payload
  const svgExportData = useMemo(() => {
    let title = 'Graphics Algorithm Visualizer';
    let defaultFilename = `${algorithm}_visualization.svg`;

    if (algorithm === 'dda') {
      title = `DDA Line Drawing: (${lineInputs.x1}, ${lineInputs.y1}) to (${lineInputs.x2}, ${lineInputs.y2})`;
      defaultFilename = `dda_line_${lineInputs.x1}_${lineInputs.y1}_to_${lineInputs.x2}_${lineInputs.y2}.svg`;
    } else if (algorithm === 'bresenham') {
      title = `Bresenham Line Algorithm: (${lineInputs.x1}, ${lineInputs.y1}) to (${lineInputs.x2}, ${lineInputs.y2})`;
      defaultFilename = `bresenham_line_${lineInputs.x1}_${lineInputs.y1}_to_${lineInputs.x2}_${lineInputs.y2}.svg`;
    } else if (algorithm === 'midpoint-line') {
      title = `Midpoint Line Drawing: (${lineInputs.x1}, ${lineInputs.y1}) to (${lineInputs.x2}, ${lineInputs.y2})`;
      defaultFilename = `midpoint_line_${lineInputs.x1}_${lineInputs.y1}_to_${lineInputs.x2}_${lineInputs.y2}.svg`;
    } else if (algorithm === 'midpoint-circle') {
      title = `Midpoint Circle Drawing: Center (${circleInputs.xc}, ${circleInputs.yc}), Radius ${circleInputs.r}`;
      defaultFilename = `midpoint_circle_r${circleInputs.r}.svg`;
    } else if (algorithm === 'cohen-sutherland') {
      title = `Cohen–Sutherland Line Clipping: Line (${clippingInputs.line.x1}, ${clippingInputs.line.y1}) to (${clippingInputs.line.x2}, ${clippingInputs.line.y2})`;
      defaultFilename = `cohen_sutherland_clipping.svg`;
    } else if (algorithm === 'sutherland-hodgman') {
      title = `Sutherland–Hodgman Polygon Clipping: ${polygonInputs.vertices.length} vertices`;
      defaultFilename = `sutherland_hodgman_clipping.svg`;
    }

    return {
      title,
      defaultFilename,
      options: {
        title,
        subtitle: 'Chetan Business School · MCA · Computer Graphics',
        pixels: visiblePixels,
        currentPixel: activeCurrentPixel,
        octantPoints: activeOctantPoints,
        idealLine:
          algorithm === 'dda' || algorithm === 'bresenham' || algorithm === 'midpoint-line'
            ? lineInputs
            : null,
        idealCircle: algorithm === 'midpoint-circle' ? circleInputs : null,
        clippingWindow: clippingDisplay?.window || polygonDisplay?.window || null,
        originalSegment: clippingDisplay?.original || null,
        clippedSegment: clippingDisplay?.clipped || null,
        clipIntersections: clippingDisplay?.intersections || [],
        originalPolygon: polygonDisplay?.original || null,
        clippedPolygon: polygonDisplay?.clipped || null,
      },
    };
  }, [
    algorithm,
    lineInputs,
    circleInputs,
    clippingInputs,
    polygonInputs,
    visiblePixels,
    activeCurrentPixel,
    activeOctantPoints,
    clippingDisplay,
    polygonDisplay,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Bar */}
      <Header
        currentAlgorithm={algorithm}
        onSelectAlgorithm={(algo) => {
          setAlgorithm(algo);
        }}
        onOpenSynopsis={() => setIsSynopsisOpen(true)}
        onExportSvg={() => setIsSvgModalOpen(true)}
      />

      {/* Algorithm Quick Info Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Info className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="font-semibold text-slate-200 shrink-0">{currentInfo.title}:</span>
          <span className="text-slate-400 truncate hidden md:inline">{currentInfo.desc}</span>
        </div>
        <div className="font-mono text-[10px] sm:text-[11px] text-sky-300 bg-slate-950/70 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-slate-800/60 overflow-x-auto whitespace-nowrap max-w-full">
          {currentInfo.formula}
        </div>
      </div>

      {/* Mobile View Toggle Bar (Only visible on screens smaller than lg) */}
      <div className="lg:hidden px-3 sm:px-4 pt-3 flex items-center">
        <div className="w-full flex items-center p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-medium shadow-sm">
          <button
            onClick={() => setMobileSection('canvas')}
            className={`flex-1 py-1.5 rounded-md transition-all text-center min-h-[34px] ${
              mobileSection === 'canvas'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Canvas & Scrubber
          </button>
          <button
            onClick={() => setMobileSection('controls')}
            className={`flex-1 py-1.5 rounded-md transition-all text-center min-h-[34px] ${
              mobileSection === 'controls'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Parameters & Math
          </button>
          <button
            onClick={() => setMobileSection('all')}
            className={`flex-1 py-1.5 rounded-md transition-all text-center min-h-[34px] ${
              mobileSection === 'all'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full View
          </button>
        </div>
      </div>

      {/* Main Educational Sandbox Layout (Two-Zone split) */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 max-w-[1720px] mx-auto w-full">
        {/* Left Zone: Visual Interactive Stage (7 cols on lg) */}
        <section
          className={`lg:col-span-7 flex flex-col gap-3 sm:gap-4 ${
            mobileSection === 'controls' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Coordinate Canvas Grid */}
          <div className="flex-1 flex flex-col">
            <GridCanvas
              pixels={visiblePixels}
              currentPixel={activeCurrentPixel}
              octantPoints={activeOctantPoints}
              idealLine={
                algorithm === 'dda' || algorithm === 'bresenham' || algorithm === 'midpoint-line'
                  ? lineInputs
                  : null
              }
              idealCircle={algorithm === 'midpoint-circle' ? circleInputs : null}
              clippingWindow={clippingDisplay?.window || polygonDisplay?.window || null}
              originalSegment={clippingDisplay?.original || null}
              clippedSegment={clippingDisplay?.clipped || null}
              clipIntersections={clippingDisplay?.intersections || []}
              originalPolygon={polygonDisplay?.original || null}
              clippedPolygon={polygonDisplay?.clipped || null}
              activeEdge={polygonDisplay?.activeEdge || null}
              onExportSvg={() => setIsSvgModalOpen(true)}
            />
          </div>

          {/* Step-by-Step Playback Controller */}
          <PlaybackBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onPlayToggle={() => {
              if (currentStep >= totalSteps - 1) {
                setCurrentStep(0);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            onStepForward={() => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))}
            onStepBackward={() => setCurrentStep((s) => Math.max(s - 1, 0))}
            onJumpToStart={() => setCurrentStep(0)}
            onJumpToEnd={() => setCurrentStep(Math.max(0, totalSteps - 1))}
            onStepChange={(st) => setCurrentStep(st)}
            onSpeedChange={(sp) => setPlaybackSpeed(sp)}
          />
        </section>

        {/* Right Zone: Controls, Mathematics Deck & Steps Ledger (5 cols on lg) */}
        <section
          className={`lg:col-span-5 flex flex-col gap-3 sm:gap-4 ${
            mobileSection === 'canvas' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* User Parameters & Presets Input Module */}
          <ControlPanel
            algorithm={algorithm}
            lineInputs={lineInputs}
            circleInputs={circleInputs}
            clippingInputs={clippingInputs}
            polygonInputs={polygonInputs}
            onLineChange={setLineInputs}
            onCircleChange={setCircleInputs}
            onClippingChange={setClippingInputs}
            onPolygonChange={setPolygonInputs}
            onResetToDefaults={handleResetInputs}
          />

          {/* Right Deck Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveDeckTab('calculations')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeDeckTab === 'calculations'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Calculations & Code
            </button>
            <button
              onClick={() => setActiveDeckTab('table')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeDeckTab === 'table'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Steps Table ({steps.length})
            </button>
          </div>

          {/* Right Deck Tab Contents */}
          <div className="flex-1 flex flex-col">
            {activeDeckTab === 'calculations' && (
              <CalculationsPanel
                algorithm={algorithm}
                currentStepData={currentStepData}
                metadata={metadata}
              />
            )}

            {activeDeckTab === 'table' && (
              <StepsTable
                algorithm={algorithm}
                steps={steps}
                currentStep={currentStep}
                onSelectStep={(st) => setCurrentStep(st)}
              />
            )}
          </div>
        </section>
      </main>

      {/* Academic Synopsis & Project Associates Modal */}
      <SynopsisModal
        isOpen={isSynopsisOpen}
        onClose={() => setIsSynopsisOpen(false)}
      />

      {/* SVG Export Modal */}
      <SvgExportModal
        isOpen={isSvgModalOpen}
        onClose={() => setIsSvgModalOpen(false)}
        exportOptions={svgExportData.options}
        defaultFilename={svgExportData.defaultFilename}
      />
    </div>
  );
}
