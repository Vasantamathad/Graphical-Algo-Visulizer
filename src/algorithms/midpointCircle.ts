/**
 * Midpoint Circle Drawing Algorithm with 8-Way Symmetry
 */
import { CircleInputs, CircleSymmetricPoints, MidpointCircleStep, Point2D } from '../types/graphics';

export interface MidpointCircleResult {
  steps: MidpointCircleStep[];
  allPixels: Point2D[];
  primaryOctantPixels: Point2D[];
  metadata: {
    xc: number;
    yc: number;
    r: number;
    p0: number;
    totalSteps: number;
    totalPlottedPixels: number;
  };
}

export function computeSymmetricPoints(xc: number, yc: number, x: number, y: number): CircleSymmetricPoints {
  return {
    octant1: { x: xc + x, y: yc + y },
    octant2: { x: xc + y, y: yc + x },
    octant3: { x: xc - y, y: yc + x },
    octant4: { x: xc - x, y: yc + y },
    octant5: { x: xc - x, y: yc - y },
    octant6: { x: xc - y, y: yc - x },
    octant7: { x: xc + y, y: yc - x },
    octant8: { x: xc + x, y: yc - y },
  };
}

export function runMidpointCircle(inputs: CircleInputs): MidpointCircleResult {
  const { xc, yc, r } = inputs;
  const radius = Math.max(1, Math.round(r));

  let x = 0;
  let y = radius;
  let pk = 1 - radius; // p0 = 1 - r

  const steps: MidpointCircleStep[] = [];
  const allPixelsMap = new Map<string, Point2D>();
  const primaryOctantPixels: Point2D[] = [];

  const addUnique = (pt: Point2D) => {
    const key = `${pt.x},${pt.y}`;
    if (!allPixelsMap.has(key)) {
      allPixelsMap.set(key, pt);
    }
  };

  let stepIndex = 0;

  while (x <= y) {
    const sym = computeSymmetricPoints(xc, yc, x, y);
    primaryOctantPixels.push({ x: xc + x, y: yc + y });

    // Add all 8 symmetric points
    Object.values(sym).forEach(addUnique);

    if (x === y) {
      steps.push({
        step: stepIndex,
        x,
        y,
        pk,
        nextPk: pk,
        action: 'E',
        points: sym,
        explanation: `Step ${stepIndex}: x = y = ${x}. Boundary reached (octant 1 meets octant 2). All 8 octants filled. Circle rasterization complete.`,
        codeLine: 10,
      });
      break;
    }

    const nextX = x + 1;
    let nextY = y;
    let nextPk = pk;
    let action: 'E' | 'SE' = 'E';

    if (pk < 0) {
      action = 'E';
      nextPk = pk + 2 * nextX + 1;
    } else {
      action = 'SE';
      nextY = y - 1;
      nextPk = pk + 2 * nextX + 1 - 2 * nextY;
    }

    const explanation = stepIndex === 0
      ? `Initial point (0, ${radius}), p0 = 1 - r = 1 - ${radius} = ${pk}. Since p0 ${pk < 0 ? '< 0' : '≥ 0'}, choose ${action} pixel (x+1, ${action === 'E' ? 'y' : 'y-1'}) and next p1 = ${nextPk}. 8 symmetrical pixels plotted.`
      : `Step ${stepIndex}: Candidate (x=${x}, y=${y}), pk = ${pk}. Since pk ${pk < 0 ? '< 0' : '≥ 0'}, choose ${action} pixel (${nextX}, ${nextY}) and next pk+1 = pk + ${action === 'E' ? `2(x+1) + 1` : `2(x+1) + 1 - 2(y-1)`} = ${nextPk}. 8 symmetrical pixels plotted.`;

    steps.push({
      step: stepIndex,
      x,
      y,
      pk,
      nextPk,
      action,
      points: sym,
      explanation,
      codeLine: pk < 0 ? 6 : 8,
    });

    x = nextX;
    y = nextY;
    pk = nextPk;
    stepIndex++;
  }

  const allPixels = Array.from(allPixelsMap.values());

  return {
    steps,
    allPixels,
    primaryOctantPixels,
    metadata: {
      xc,
      yc,
      r: radius,
      p0: 1 - radius,
      totalSteps: steps.length,
      totalPlottedPixels: allPixels.length,
    },
  };
}

export const MIDPOINT_CIRCLE_PSEUDOCODE = [
  '1.  x = 0;  y = r;',
  '2.  p0 = 1 - r;',
  '3.  plot8WaySymmetry(xc, yc, x, y);',
  '4.  while x < y do:',
  '5.      x = x + 1;',
  '6.      if pk < 0 then:',
  '7.          pk+1 = pk + 2 * x + 1;',
  '8.      else:',
  '9.          y = y - 1;  pk+1 = pk + 2 * x + 1 - 2 * y;',
  '10.     plot8WaySymmetry(xc, yc, x, y);',
];
