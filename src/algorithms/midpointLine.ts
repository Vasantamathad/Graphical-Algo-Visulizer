/**
 * Midpoint Line Drawing Algorithm
 * Evaluates the line equation F(x, y) = ax + by + c at the midpoint between candidate pixels.
 */
import { LineInputs, MidpointLineStep, Point2D } from '../types/graphics';

export interface MidpointLineResult {
  steps: MidpointLineStep[];
  pixels: Point2D[];
  metadata: {
    dx: number;
    dy: number;
    absDx: number;
    absDy: number;
    sx: number;
    sy: number;
    drivingAxis: 'x' | 'y';
    d0: number;
    twoDy: number;
    twoDyMinusTwoDx: number;
    slope: number;
  };
}

export function runMidpointLine(inputs: LineInputs): MidpointLineResult {
  const { x1, y1, x2, y2 } = inputs;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const sx = dx >= 0 ? 1 : -1;
  const sy = dy >= 0 ? 1 : -1;
  const slope = dx !== 0 ? dy / dx : dy >= 0 ? Infinity : -Infinity;

  const steps: MidpointLineStep[] = [];
  const pixels: Point2D[] = [];

  const drivingAxis: 'x' | 'y' = absDx >= absDy ? 'x' : 'y';

  let currX = x1;
  let currY = y1;

  if (drivingAxis === 'x') {
    // Driving axis is X (|slope| <= 1)
    // d0 = 2*|dy| - |dx|
    let d = 2 * absDy - absDx;
    const d0 = d;
    const twoDy = 2 * absDy;
    const twoDyMinusTwoDx = 2 * absDy - 2 * absDx;

    for (let k = 0; k <= absDx; k++) {
      pixels.push({ x: currX, y: currY });

      const midX = currX + 0.5 * sx;
      const midY = currY + 0.5 * sy;

      if (k === absDx) {
        steps.push({
          step: k,
          x: currX,
          y: currY,
          d,
          nextD: d,
          chosenPixel: 'Endpoint reached',
          midpoint: { x: Number(midX.toFixed(2)), y: Number(midY.toFixed(2)) },
          explanation: `Step ${k}: Reached final endpoint (${currX}, ${currY}). Rasterization complete.`,
          codeLine: 9,
        });
        break;
      }

      // If d < 0, midpoint is above line -> line passes closer to East pixel
      const condition = d < 0;
      const nextD = condition ? d + twoDy : d + twoDyMinusTwoDx;
      const chosenPixel = condition ? (sx > 0 ? 'E (East)' : 'W (West)') : (sx > 0 && sy > 0 ? 'NE (North-East)' : sx > 0 && sy < 0 ? 'SE (South-East)' : sx < 0 && sy > 0 ? 'NW (North-West)' : 'SW (South-West)');

      steps.push({
        step: k,
        x: currX,
        y: currY,
        d,
        nextD,
        chosenPixel,
        midpoint: { x: Number(midX.toFixed(2)), y: Number(midY.toFixed(2)) },
        explanation: k === 0
          ? `Initial point (${currX}, ${currY}). Initial decision d0 = 2|Δy| - |Δx| = 2(${absDy}) - ${absDx} = ${d0}. Midpoint tested at (${midX.toFixed(1)}, ${midY.toFixed(1)}). Since d0 ${condition ? '< 0' : '≥ 0'}, choose ${chosenPixel}, next d1 = ${nextD}.`
          : `Step ${k}: Current (${currX}, ${currY}), d = ${d}. Midpoint tested at (${midX.toFixed(1)}, ${midY.toFixed(1)}). Since d ${condition ? '< 0 (line is closer to horizontal)' : '≥ 0 (line is closer to diagonal)'}, choose ${chosenPixel}, next d = ${nextD}.`,
        codeLine: condition ? 6 : 8,
      });

      currX += sx;
      if (!condition) {
        currY += sy;
      }
      d = nextD;
    }

    return {
      steps,
      pixels,
      metadata: {
        dx,
        dy,
        absDx,
        absDy,
        sx,
        sy,
        drivingAxis,
        d0,
        twoDy,
        twoDyMinusTwoDx,
        slope: Number(slope.toFixed(4)),
      },
    };
  } else {
    // Driving axis is Y (|slope| > 1)
    let d = 2 * absDx - absDy;
    const d0 = d;
    const twoDx = 2 * absDx;
    const twoDxMinusTwoDy = 2 * absDx - 2 * absDy;

    for (let k = 0; k <= absDy; k++) {
      pixels.push({ x: currX, y: currY });

      const midX = currX + 0.5 * sx;
      const midY = currY + 0.5 * sy;

      if (k === absDy) {
        steps.push({
          step: k,
          x: currX,
          y: currY,
          d,
          nextD: d,
          chosenPixel: 'Endpoint reached',
          midpoint: { x: Number(midX.toFixed(2)), y: Number(midY.toFixed(2)) },
          explanation: `Step ${k}: Reached final endpoint (${currX}, ${currY}). Rasterization complete.`,
          codeLine: 9,
        });
        break;
      }

      const condition = d < 0;
      const nextD = condition ? d + twoDx : d + twoDxMinusTwoDy;
      const chosenPixel = condition ? (sy > 0 ? 'N (North)' : 'S (South)') : (sy > 0 && sx > 0 ? 'NE (North-East)' : sy > 0 && sx < 0 ? 'NW (North-West)' : sy < 0 && sx > 0 ? 'SE (South-East)' : 'SW (South-West)');

      steps.push({
        step: k,
        x: currX,
        y: currY,
        d,
        nextD,
        chosenPixel,
        midpoint: { x: Number(midX.toFixed(2)), y: Number(midY.toFixed(2)) },
        explanation: k === 0
          ? `Initial point (${currX}, ${currY}). Steep line (|m| > 1), Y is driving axis. d0 = 2|Δx| - |Δy| = 2(${absDx}) - ${absDy} = ${d0}. Midpoint at (${midX.toFixed(1)}, ${midY.toFixed(1)}). Since d0 ${condition ? '< 0' : '≥ 0'}, choose ${chosenPixel}, next d1 = ${nextD}.`
          : `Step ${k}: Current (${currX}, ${currY}), d = ${d}. Midpoint at (${midX.toFixed(1)}, ${midY.toFixed(1)}). Since d ${condition ? '< 0' : '≥ 0'}, choose ${chosenPixel}, next d = ${nextD}.`,
        codeLine: condition ? 6 : 8,
      });

      currY += sy;
      if (!condition) {
        currX += sx;
      }
      d = nextD;
    }

    return {
      steps,
      pixels,
      metadata: {
        dx,
        dy,
        absDx,
        absDy,
        sx,
        sy,
        drivingAxis,
        d0,
        twoDy: twoDx,
        twoDyMinusTwoDx: twoDxMinusTwoDy,
        slope: Number(slope.toFixed(4)),
      },
    };
  }
}

export const MIDPOINT_LINE_PSEUDOCODE = [
  '1.  dx = abs(x2 - x1); dy = abs(y2 - y1);',
  '2.  d0 = 2 * dy - dx;',
  '3.  x = x1; y = y1; plot(x, y);',
  '4.  for k = 0 to dx - 1 do:',
  '5.      if d < 0 then: // Midpoint above line',
  '6.          x = x + sx; d = d + 2 * dy; // Select E',
  '7.      else:          // Midpoint below line',
  '8.          x = x + sx; y = y + sy; d = d + 2*dy - 2*dx; // Select NE',
  '9.      plot(x, y);',
];
