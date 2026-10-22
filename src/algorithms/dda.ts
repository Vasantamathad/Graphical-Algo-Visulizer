/**
 * Digital Differential Analyzer (DDA) Line Drawing Algorithm
 */
import { DdaStep, LineInputs, Point2D } from '../types/graphics';

export interface DdaResult {
  steps: DdaStep[];
  pixels: Point2D[];
  metadata: {
    dx: number;
    dy: number;
    stepsCount: number;
    xInc: number;
    yInc: number;
    slope: number;
    isVertical: boolean;
  };
}

export function runDDA(inputs: LineInputs): DdaResult {
  const { x1, y1, x2, y2 } = inputs;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const stepsCount = Math.max(Math.abs(dx), Math.abs(dy));

  const isVertical = dx === 0;
  const slope = isVertical ? (dy > 0 ? Infinity : -Infinity) : dy / dx;

  const steps: DdaStep[] = [];
  const pixels: Point2D[] = [];

  if (stepsCount === 0) {
    const p = { x: Math.round(x1), y: Math.round(y1) };
    pixels.push(p);
    steps.push({
      step: 0,
      xFloat: x1,
      yFloat: y1,
      plotX: p.x,
      plotY: p.y,
      explanation: `Starting and ending points are identical (${x1}, ${y1}). Single pixel plotted.`,
      codeLine: 4,
    });
    return {
      steps,
      pixels,
      metadata: {
        dx,
        dy,
        stepsCount: 0,
        xInc: 0,
        yInc: 0,
        slope: 0,
        isVertical: false,
      },
    };
  }

  const xInc = dx / stepsCount;
  const yInc = dy / stepsCount;

  let currentX = x1;
  let currentY = y1;

  for (let k = 0; k <= stepsCount; k++) {
    const px = Math.round(currentX);
    const py = Math.round(currentY);
    pixels.push({ x: px, y: py });

    let explanation = '';
    if (k === 0) {
      explanation = `Initial point (x0, y0) = (${x1}, ${y1}). Rounded pixel: (${px}, ${py}).`;
    } else {
      explanation = `Step ${k}: x = ${currentX.toFixed(2)} + ${xInc.toFixed(2)} = ${currentX.toFixed(2)}, y = ${currentY.toFixed(2)} + ${yInc.toFixed(2)} = ${currentY.toFixed(2)}. Plotted pixel: round(${currentX.toFixed(2)})=${px}, round(${currentY.toFixed(2)})=${py}.`;
    }

    steps.push({
      step: k,
      xFloat: Number(currentX.toFixed(4)),
      yFloat: Number(currentY.toFixed(4)),
      plotX: px,
      plotY: py,
      explanation,
      codeLine: k === 0 ? 5 : 7,
    });

    currentX += xInc;
    currentY += yInc;
  }

  return {
    steps,
    pixels,
    metadata: {
      dx,
      dy,
      stepsCount,
      xInc: Number(xInc.toFixed(4)),
      yInc: Number(yInc.toFixed(4)),
      slope: Number(slope.toFixed(4)),
      isVertical,
    },
  };
}

export const DDA_PSEUDOCODE = [
  '1.  dx = x2 - x1;  dy = y2 - y1;',
  '2.  steps = max(abs(dx), abs(dy));',
  '3.  xInc = dx / steps;  yInc = dy / steps;',
  '4.  x = x1;  y = y1;',
  '5.  plot(round(x), round(y));',
  '6.  for k = 1 to steps do:',
  '7.      x = x + xInc;',
  '8.      y = y + yInc;',
  '9.      plot(round(x), round(y));',
];
