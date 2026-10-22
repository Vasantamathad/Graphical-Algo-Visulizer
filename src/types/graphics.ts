/**
 * Graphics Algorithm Visualizer - Core Types
 */

export type AlgorithmType =
  | 'dda'
  | 'bresenham'
  | 'midpoint-line'
  | 'midpoint-circle'
  | 'cohen-sutherland'
  | 'sutherland-hodgman';

export interface Point2D {
  x: number;
  y: number;
}

export interface LineInputs {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface CircleInputs {
  xc: number;
  yc: number;
  r: number;
}

export interface ClippingWindow {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export interface ClippingInputs {
  line: LineInputs;
  window: ClippingWindow;
}

export interface PolygonInputs {
  vertices: Point2D[];
  window: ClippingWindow;
}

export interface StepPixel {
  x: number;
  y: number;
  octant?: number;
  color?: string;
  label?: string;
}

export interface DdaStep {
  step: number;
  xFloat: number;
  yFloat: number;
  plotX: number;
  plotY: number;
  explanation: string;
  codeLine: number;
}

export interface BresenhamStep {
  step: number;
  x: number;
  y: number;
  pk: number;
  nextPk: number;
  chosenPixel: string; // 'E' (East) or 'NE' (North-East) or octant-specific
  explanation: string;
  codeLine: number;
}

export interface MidpointLineStep {
  step: number;
  x: number;
  y: number;
  d: number;
  nextD: number;
  chosenPixel: string; // 'E' (East) or 'NE' (North-East)
  midpoint: { x: number; y: number };
  explanation: string;
  codeLine: number;
}

export interface CircleSymmetricPoints {
  octant1: Point2D; // (xc + x, yc + y)
  octant2: Point2D; // (xc + y, yc + x)
  octant3: Point2D; // (xc - y, yc + x)
  octant4: Point2D; // (xc - x, yc + y)
  octant5: Point2D; // (xc - x, yc - y)
  octant6: Point2D; // (xc - y, yc - x)
  octant7: Point2D; // (xc + y, yc - x)
  octant8: Point2D; // (xc + x, yc - y)
  [key: string]: Point2D;
}

export interface MidpointCircleStep {
  step: number;
  x: number;
  y: number;
  pk: number;
  nextPk: number;
  action: 'E' | 'SE'; // E: y remains same, SE: y decreases
  points: CircleSymmetricPoints;
  explanation: string;
  codeLine: number;
}

export interface CohenSutherlandStep {
  step: number;
  p1: Point2D;
  p2: Point2D;
  code1: number; // 4-bit code
  code2: number; // 4-bit code
  code1Str: string;
  code2Str: string;
  action: 'trivial-accept' | 'trivial-reject' | 'clip-p1' | 'clip-p2' | 'finished';
  boundaryClipped?: 'LEFT' | 'RIGHT' | 'BOTTOM' | 'TOP';
  intersection?: Point2D;
  explanation: string;
  codeLine: number;
}

export interface SutherlandHodgmanStep {
  step: number;
  stage: 'initial' | 'clipping-edge' | 'finished';
  edgeIndex?: number; // 0: Left, 1: Right, 2: Bottom, 3: Top
  edgeName?: string;
  boundaryFormula?: string;
  inputVertices: Point2D[];
  outputVertices: Point2D[];
  activePair?: {
    s: Point2D;
    p: Point2D;
    caseType: 'in-in' | 'in-out' | 'out-out' | 'out-in';
    intersection?: Point2D;
  };
  explanation: string;
  codeLine: number;
}

export interface PresetCase<T> {
  name: string;
  description: string;
  data: T;
}
