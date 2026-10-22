/**
 * Sutherland-Hodgman Polygon Clipping Algorithm
 * Iteratively clips a polygon against each edge of a convex clipping window (Left, Right, Bottom, Top).
 */
import { ClippingWindow, Point2D, PolygonInputs, SutherlandHodgmanStep } from '../types/graphics';

export interface SutherlandHodgmanResult {
  steps: SutherlandHodgmanStep[];
  originalPolygon: Point2D[];
  clippedPolygon: Point2D[];
  stagePolygons: { edgeName: string; vertices: Point2D[] }[];
  isFullyClipped: boolean;
  metadata: {
    initialVertexCount: number;
    finalVertexCount: number;
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
  };
}

type EdgeType = 'LEFT' | 'RIGHT' | 'BOTTOM' | 'TOP';

function isInside(p: Point2D, edge: EdgeType, win: ClippingWindow): boolean {
  switch (edge) {
    case 'LEFT':
      return p.x >= win.xmin;
    case 'RIGHT':
      return p.x <= win.xmax;
    case 'BOTTOM':
      return p.y >= win.ymin;
    case 'TOP':
      return p.y <= win.ymax;
  }
}

function computeIntersection(s: Point2D, p: Point2D, edge: EdgeType, win: ClippingWindow): Point2D {
  const dx = p.x - s.x;
  const dy = p.y - s.y;

  let x = 0;
  let y = 0;

  switch (edge) {
    case 'LEFT':
      x = win.xmin;
      y = dx !== 0 ? s.y + (dy * (win.xmin - s.x)) / dx : s.y;
      break;
    case 'RIGHT':
      x = win.xmax;
      y = dx !== 0 ? s.y + (dy * (win.xmax - s.x)) / dx : s.y;
      break;
    case 'BOTTOM':
      y = win.ymin;
      x = dy !== 0 ? s.x + (dx * (win.ymin - s.y)) / dy : s.x;
      break;
    case 'TOP':
      y = win.ymax;
      x = dy !== 0 ? s.x + (dx * (win.ymax - s.y)) / dy : s.x;
      break;
  }

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
}

export function runSutherlandHodgman(inputs: PolygonInputs): SutherlandHodgmanResult {
  const { vertices, window: win } = inputs;
  const steps: SutherlandHodgmanStep[] = [];
  const stagePolygons: { edgeName: string; vertices: Point2D[] }[] = [];

  const edges: { edge: EdgeType; name: string; formula: string }[] = [
    { edge: 'LEFT', name: 'Left Edge', formula: `x ≥ ${win.xmin}` },
    { edge: 'RIGHT', name: 'Right Edge', formula: `x ≤ ${win.xmax}` },
    { edge: 'BOTTOM', name: 'Bottom Edge', formula: `y ≥ ${win.ymin}` },
    { edge: 'TOP', name: 'Top Edge', formula: `y ≤ ${win.ymax}` },
  ];

  let currentPolygon: Point2D[] = vertices.map((v) => ({ ...v }));

  // Initial step
  steps.push({
    step: 0,
    stage: 'initial',
    inputVertices: [...currentPolygon],
    outputVertices: [...currentPolygon],
    explanation: `Initial Subject Polygon with ${vertices.length} vertices: [${vertices.map((v) => `(${v.x}, ${v.y})`).join(', ')}]. Window: [${win.xmin}, ${win.xmax}] × [${win.ymin}, ${win.ymax}].`,
    codeLine: 1,
  });

  for (let eIdx = 0; eIdx < edges.length; eIdx++) {
    const { edge, name, formula } = edges[eIdx];
    const inputVertices = [...currentPolygon];
    const outputVertices: Point2D[] = [];

    if (inputVertices.length === 0) {
      steps.push({
        step: steps.length,
        stage: 'clipping-edge',
        edgeIndex: eIdx,
        edgeName: name,
        boundaryFormula: formula,
        inputVertices: [],
        outputVertices: [],
        explanation: `Clipping against ${name} (${formula}): Polygon is already empty. Output remains empty.`,
        codeLine: 4,
      });
      break;
    }

    // Process all edges S -> P
    for (let i = 0; i < inputVertices.length; i++) {
      const s = inputVertices[i];
      const p = inputVertices[(i + 1) % inputVertices.length];

      const sIn = isInside(s, edge, win);
      const pIn = isInside(p, edge, win);

      if (sIn && pIn) {
        // Case 1: In -> In
        outputVertices.push(p);
        steps.push({
          step: steps.length,
          stage: 'clipping-edge',
          edgeIndex: eIdx,
          edgeName: name,
          boundaryFormula: formula,
          inputVertices,
          outputVertices: [...outputVertices],
          activePair: { s, p, caseType: 'in-in' },
          explanation: `Testing edge ${name} (${formula}) for S(${s.x},${s.y}) → P(${p.x},${p.y}): Case 1 (Both Inside). Save vertex P(${p.x}, ${p.y}).`,
          codeLine: 6,
        });
      } else if (sIn && !pIn) {
        // Case 2: In -> Out
        const intersection = computeIntersection(s, p, edge, win);
        outputVertices.push(intersection);
        steps.push({
          step: steps.length,
          stage: 'clipping-edge',
          edgeIndex: eIdx,
          edgeName: name,
          boundaryFormula: formula,
          inputVertices,
          outputVertices: [...outputVertices],
          activePair: { s, p, caseType: 'in-out', intersection },
          explanation: `Testing edge ${name} (${formula}) for S(${s.x},${s.y}) → P(${p.x},${p.y}): Case 2 (Inside to Outside). Calculate boundary intersection I(${intersection.x}, ${intersection.y}). Save I.`,
          codeLine: 8,
        });
      } else if (!sIn && !pIn) {
        // Case 3: Out -> Out
        steps.push({
          step: steps.length,
          stage: 'clipping-edge',
          edgeIndex: eIdx,
          edgeName: name,
          boundaryFormula: formula,
          inputVertices,
          outputVertices: [...outputVertices],
          activePair: { s, p, caseType: 'out-out' },
          explanation: `Testing edge ${name} (${formula}) for S(${s.x},${s.y}) → P(${p.x},${p.y}): Case 3 (Both Outside). Line is outside boundary; discard. No output added.`,
          codeLine: 10,
        });
      } else if (!sIn && pIn) {
        // Case 4: Out -> In
        const intersection = computeIntersection(s, p, edge, win);
        outputVertices.push(intersection);
        outputVertices.push(p);
        steps.push({
          step: steps.length,
          stage: 'clipping-edge',
          edgeIndex: eIdx,
          edgeName: name,
          boundaryFormula: formula,
          inputVertices,
          outputVertices: [...outputVertices],
          activePair: { s, p, caseType: 'out-in', intersection },
          explanation: `Testing edge ${name} (${formula}) for S(${s.x},${s.y}) → P(${p.x},${p.y}): Case 4 (Outside to Inside). Calculate boundary intersection I(${intersection.x}, ${intersection.y}). Save I and vertex P(${p.x}, ${p.y}).`,
          codeLine: 12,
        });
      }
    }

    currentPolygon = outputVertices;
    stagePolygons.push({ edgeName: name, vertices: [...currentPolygon] });
  }

  // Final step
  steps.push({
    step: steps.length,
    stage: 'finished',
    inputVertices: [...vertices],
    outputVertices: [...currentPolygon],
    explanation: currentPolygon.length > 0
      ? `Polygon Clipping Completed! Final clipped polygon has ${currentPolygon.length} vertices: [${currentPolygon.map((v) => `(${v.x}, ${v.y})`).join(', ')}].`
      : 'Polygon is completely outside the clipping window. Result is empty.',
    codeLine: 14,
  });

  return {
    steps,
    originalPolygon: vertices,
    clippedPolygon: currentPolygon,
    stagePolygons,
    isFullyClipped: currentPolygon.length === 0,
    metadata: {
      initialVertexCount: vertices.length,
      finalVertexCount: currentPolygon.length,
      xmin: win.xmin,
      xmax: win.xmax,
      ymin: win.ymin,
      ymax: win.ymax,
    },
  };
}

export const SUTHERLAND_HODGMAN_PSEUDOCODE = [
  '1.  for each edge of clipping window (LEFT, RIGHT, BOTTOM, TOP) do:',
  '2.      OutList = [];',
  '3.      for each edge (S, P) of current Polygon do:',
  '4.          if S inside and P inside then:',
  '5.              OutList.append(P); // Case 1',
  '6.          else if S inside and P outside then:',
  '7.              I = intersect(S, P, Edge); OutList.append(I); // Case 2',
  '8.          else if S outside and P outside then:',
  '9.              // Case 3: Do nothing',
  '10.         else if S outside and P inside then:',
  '11.             I = intersect(S, P, Edge); OutList.append(I); OutList.append(P); // Case 4',
  '12.     Polygon = OutList;',
  '13. return Polygon;',
];
