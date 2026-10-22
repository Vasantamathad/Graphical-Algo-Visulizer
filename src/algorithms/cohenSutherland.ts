/**
 * Cohen-Sutherland Line Clipping Algorithm
 */
import { ClippingInputs, CohenSutherlandStep, Point2D } from '../types/graphics';

// Outcode bitmasks
export const INSIDE = 0; // 0000
export const LEFT = 1;   // 0001
export const RIGHT = 2;  // 0010
export const BOTTOM = 4; // 0100
export const TOP = 8;    // 1000

export function computeOutcode(x: number, y: number, xmin: number, xmax: number, ymin: number, ymax: number): number {
  let code = INSIDE;
  if (x < xmin) code |= LEFT;
  else if (x > xmax) code |= RIGHT;
  if (y < ymin) code |= BOTTOM;
  else if (y > ymax) code |= TOP;
  return code;
}

export function outcodeToString(code: number): string {
  // Format as 4-bit TBRL (Top, Bottom, Right, Left)
  const t = (code & TOP) ? '1' : '0';
  const b = (code & BOTTOM) ? '1' : '0';
  const r = (code & RIGHT) ? '1' : '0';
  const l = (code & LEFT) ? '1' : '0';
  return `${t}${b}${r}${l}`;
}

export interface CohenSutherlandResult {
  steps: CohenSutherlandStep[];
  isAccepted: boolean;
  originalP1: Point2D;
  originalP2: Point2D;
  finalP1: Point2D | null;
  finalP2: Point2D | null;
  metadata: {
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
    iterations: number;
  };
}

export function runCohenSutherland(inputs: ClippingInputs): CohenSutherlandResult {
  const { line, window } = inputs;
  const { xmin, xmax, ymin, ymax } = window;

  let x1 = line.x1;
  let y1 = line.y1;
  let x2 = line.x2;
  let y2 = line.y2;

  let code1 = computeOutcode(x1, y1, xmin, xmax, ymin, ymax);
  let code2 = computeOutcode(x2, y2, xmin, xmax, ymin, ymax);

  const steps: CohenSutherlandStep[] = [];
  let accept = false;
  let iteration = 0;
  const maxIterations = 10;

  while (iteration < maxIterations) {
    const code1Str = outcodeToString(code1);
    const code2Str = outcodeToString(code2);

    // Case 1: Trivial Accept (both endpoints inside)
    if ((code1 | code2) === 0) {
      accept = true;
      steps.push({
        step: iteration,
        p1: { x: Number(x1.toFixed(2)), y: Number(y1.toFixed(2)) },
        p2: { x: Number(x2.toFixed(2)), y: Number(y2.toFixed(2)) },
        code1,
        code2,
        code1Str,
        code2Str,
        action: 'trivial-accept',
        explanation: `Step ${iteration}: Trivial Accept! Both Outcodes are 0000 (code1 | code2 = 0). The line segment lies completely inside the clipping window.`,
        codeLine: 4,
      });
      break;
    }

    // Case 2: Trivial Reject (both endpoints share an outside zone)
    if ((code1 & code2) !== 0) {
      accept = false;
      const sharedZone = (code1 & code2 & TOP) ? 'TOP' :
                         (code1 & code2 & BOTTOM) ? 'BOTTOM' :
                         (code1 & code2 & RIGHT) ? 'RIGHT' : 'LEFT';
      steps.push({
        step: iteration,
        p1: { x: Number(x1.toFixed(2)), y: Number(y1.toFixed(2)) },
        p2: { x: Number(x2.toFixed(2)), y: Number(y2.toFixed(2)) },
        code1,
        code2,
        code1Str,
        code2Str,
        action: 'trivial-reject',
        explanation: `Step ${iteration}: Trivial Reject! Bitwise AND (code1 & code2) = ${outcodeToString(code1 & code2)} ≠ 0000. Both points lie outside on the ${sharedZone} side. Entire line is invisible.`,
        codeLine: 6,
      });
      break;
    }

    // Case 3: Partial clipping required
    const codeOut = code1 !== 0 ? code1 : code2;
    const isP1 = code1 !== 0;
    let x = 0;
    let y = 0;
    let boundary: 'LEFT' | 'RIGHT' | 'BOTTOM' | 'TOP' = 'TOP';

    if (codeOut & TOP) {
      // Point is above the clip rectangle
      x = x1 + ((x2 - x1) * (ymax - y1)) / (y2 - y1);
      y = ymax;
      boundary = 'TOP';
    } else if (codeOut & BOTTOM) {
      // Point is below the clip rectangle
      x = x1 + ((x2 - x1) * (ymin - y1)) / (y2 - y1);
      y = ymin;
      boundary = 'BOTTOM';
    } else if (codeOut & RIGHT) {
      // Point is to the right of clip rectangle
      y = y1 + ((y2 - y1) * (xmax - x1)) / (x2 - x1);
      x = xmax;
      boundary = 'RIGHT';
    } else if (codeOut & LEFT) {
      // Point is to the left of clip rectangle
      y = y1 + ((y2 - y1) * (xmin - x1)) / (x2 - x1);
      x = xmin;
      boundary = 'LEFT';
    }

    const intersection: Point2D = { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };

    steps.push({
      step: iteration,
      p1: { x: Number(x1.toFixed(2)), y: Number(y1.toFixed(2)) },
      p2: { x: Number(x2.toFixed(2)), y: Number(y2.toFixed(2)) },
      code1,
      code2,
      code1Str,
      code2Str,
      action: isP1 ? 'clip-p1' : 'clip-p2',
      boundaryClipped: boundary,
      intersection,
      explanation: `Step ${iteration}: Clipping ${isP1 ? 'P1' : 'P2'} against the ${boundary} boundary. Calculated intersection point: (${intersection.x}, ${intersection.y}). Replacing ${isP1 ? 'P1' : 'P2'} and updating Outcode.`,
      codeLine: 8,
    });

    if (isP1) {
      x1 = x;
      y1 = y;
      code1 = computeOutcode(x1, y1, xmin, xmax, ymin, ymax);
    } else {
      x2 = x;
      y2 = y;
      code2 = computeOutcode(x2, y2, xmin, xmax, ymin, ymax);
    }

    iteration++;
  }

  return {
    steps,
    isAccepted: accept,
    originalP1: { x: line.x1, y: line.y1 },
    originalP2: { x: line.x2, y: line.y2 },
    finalP1: accept ? { x: Number(x1.toFixed(2)), y: Number(y1.toFixed(2)) } : null,
    finalP2: accept ? { x: Number(x2.toFixed(2)), y: Number(y2.toFixed(2)) } : null,
    metadata: {
      xmin,
      xmax,
      ymin,
      ymax,
      iterations: steps.length,
    },
  };
}

export const COHEN_SUTHERLAND_PSEUDOCODE = [
  '1.  code1 = computeOutcode(x1, y1); code2 = computeOutcode(x2, y2);',
  '2.  while true do:',
  '3.      if (code1 | code2) == 0 then:',
  '4.          accept = true; break; // Trivial Accept',
  '5.      else if (code1 & code2) != 0 then:',
  '6.          accept = false; break; // Trivial Reject',
  '7.      else:',
  '8.          codeOut = (code1 != 0) ? code1 : code2;',
  '9.          find intersection with window edge (LEFT, RIGHT, BOTTOM, TOP);',
  '10.         replace outside endpoint and recompute outcode;',
];
