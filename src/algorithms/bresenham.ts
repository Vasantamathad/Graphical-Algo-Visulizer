/**
 * Bresenham's Line Drawing Algorithm (Generalized for all octants)
 */
import { BresenhamStep, LineInputs, Point2D } from '../types/graphics';

export interface BresenhamResult {
  steps: BresenhamStep[];
  pixels: Point2D[];
  metadata: {
    dx: number;
    dy: number;
    absDx: number;
    absDy: number;
    sx: number;
    sy: number;
    drivingAxis: 'x' | 'y';
    p0: number;
    twoDy: number;
    twoDyMinusTwoDx: number;
    slope: number;
  };
}

export function runBresenham(inputs: LineInputs): BresenhamResult {
  const { x1, y1, x2, y2 } = inputs;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const sx = dx >= 0 ? 1 : -1;
  const sy = dy >= 0 ? 1 : -1;
  const slope = dx !== 0 ? dy / dx : dy >= 0 ? Infinity : -Infinity;

  const steps: BresenhamStep[] = [];
  const pixels: Point2D[] = [];

  const drivingAxis: 'x' | 'y' = absDx >= absDy ? 'x' : 'y';

  let currX = x1;
  let currY = y1;

  if (drivingAxis === 'x') {
    // |slope| <= 1: x is driving axis
    let pk = 2 * absDy - absDx;
    const p0 = pk;
    const twoDy = 2 * absDy;
    const twoDyMinusTwoDx = 2 * absDy - 2 * absDx;

    for (let k = 0; k <= absDx; k++) {
      pixels.push({ x: currX, y: currY });

      if (k === absDx) {
        // Last point
        steps.push({
          step: k,
          x: currX,
          y: currY,
          pk,
          nextPk: pk,
          chosenPixel: 'Endpoint reached',
          explanation: `Step ${k}: Plotted final endpoint (${currX}, ${currY}). Rasterization complete.`,
          codeLine: 9,
        });
        break;
      }

      const nextPk = pk < 0 ? pk + twoDy : pk + twoDyMinusTwoDx;
      const chosenPixel = pk < 0 ? (sx > 0 ? 'E (East)' : 'W (West)') : (sx > 0 && sy > 0 ? 'NE (North-East)' : sx > 0 && sy < 0 ? 'SE (South-East)' : sx < 0 && sy > 0 ? 'NW (North-West)' : 'SW (South-West)');
      const conditionMet = pk < 0;

      steps.push({
        step: k,
        x: currX,
        y: currY,
        pk,
        nextPk,
        chosenPixel,
        explanation: k === 0
          ? `Initial point (${currX}, ${currY}). p0 = 2|Δy| - |Δx| = 2(${absDy}) - ${absDx} = ${p0}. Since p0 ${conditionMet ? '< 0' : '≥ 0'}, next p1 = p0 + ${conditionMet ? `2|Δy| (${twoDy})` : `(2|Δy| - 2|Δx|) (${twoDyMinusTwoDx})`} = ${nextPk}.`
          : `Step ${k}: Current point (${currX}, ${currY}), pk = ${pk}. Since pk ${conditionMet ? '< 0' : '≥ 0'}, next pk+1 = pk + ${conditionMet ? `2|Δy| (${twoDy})` : `(2|Δy| - 2|Δx|) (${twoDyMinusTwoDx})`} = ${nextPk}. Choose ${chosenPixel}.`,
        codeLine: conditionMet ? 6 : 8,
      });

      currX += sx;
      if (!conditionMet) {
        currY += sy;
      }
      pk = nextPk;
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
        p0,
        twoDy,
        twoDyMinusTwoDx,
        slope: Number(slope.toFixed(4)),
      },
    };
  } else {
    // |slope| > 1: y is driving axis
    let pk = 2 * absDx - absDy;
    const p0 = pk;
    const twoDx = 2 * absDx;
    const twoDxMinusTwoDy = 2 * absDx - 2 * absDy;

    for (let k = 0; k <= absDy; k++) {
      pixels.push({ x: currX, y: currY });

      if (k === absDy) {
        steps.push({
          step: k,
          x: currX,
          y: currY,
          pk,
          nextPk: pk,
          chosenPixel: 'Endpoint reached',
          explanation: `Step ${k}: Plotted final endpoint (${currX}, ${currY}). Rasterization complete.`,
          codeLine: 9,
        });
        break;
      }

      const nextPk = pk < 0 ? pk + twoDx : pk + twoDxMinusTwoDy;
      const conditionMet = pk < 0;
      const chosenPixel = pk < 0 ? (sy > 0 ? 'N (North)' : 'S (South)') : (sy > 0 && sx > 0 ? 'NE (North-East)' : sy > 0 && sx < 0 ? 'NW (North-West)' : sy < 0 && sx > 0 ? 'SE (South-East)' : 'SW (South-West)');

      steps.push({
        step: k,
        x: currX,
        y: currY,
        pk,
        nextPk,
        chosenPixel,
        explanation: k === 0
          ? `Initial point (${currX}, ${currY}). Steep line (|m| > 1), driving axis is Y. p0 = 2|Δx| - |Δy| = 2(${absDx}) - ${absDy} = ${p0}. Since p0 ${conditionMet ? '< 0' : '≥ 0'}, next p1 = ${nextPk}.`
          : `Step ${k}: Current point (${currX}, ${currY}), pk = ${pk}. Since pk ${conditionMet ? '< 0' : '≥ 0'}, choose ${chosenPixel}, next pk+1 = ${nextPk}.`,
        codeLine: conditionMet ? 6 : 8,
      });

      currY += sy;
      if (!conditionMet) {
        currX += sx;
      }
      pk = nextPk;
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
        p0,
        twoDy: twoDx,
        twoDyMinusTwoDx: twoDxMinusTwoDy,
        slope: Number(slope.toFixed(4)),
      },
    };
  }
}

export const BRESENHAM_PSEUDOCODE = [
  '1.  dx = abs(x2 - x1);  dy = abs(y2 - y1);',
  '2.  p0 = 2 * dy - dx;',
  '3.  x = x1;  y = y1;  plot(x, y);',
  '4.  for k = 0 to dx - 1 do:',
  '5.      if pk < 0 then:',
  '6.          x = x + sx;  pk+1 = pk + 2 * dy;',
  '7.      else:',
  '8.          x = x + sx;  y = y + sy;  pk+1 = pk + 2*dy - 2*dx;',
  '9.      plot(x, y);',
];
