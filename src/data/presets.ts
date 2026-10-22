/**
 * Preset test cases for all graphics algorithms
 */
import { ClippingInputs, CircleInputs, LineInputs, PolygonInputs, PresetCase } from '../types/graphics';

export const LINE_PRESETS: PresetCase<LineInputs>[] = [
  {
    name: 'Standard Line (0 < m < 1)',
    description: 'Gentle positive slope line from (2, 3) to (12, 8) with m = 0.5',
    data: { x1: 2, y1: 3, x2: 12, y2: 8 },
  },
  {
    name: 'Synopsis Example (2, 2) to (8, 5)',
    description: 'Direct example from synopsis section 5.3',
    data: { x1: 2, y1: 2, x2: 8, y2: 5 },
  },
  {
    name: 'Steep Slope Line (m > 1)',
    description: 'Steep line from (2, 2) to (6, 13) where Y is driving axis',
    data: { x1: 2, y1: 2, x2: 6, y2: 13 },
  },
  {
    name: 'Exact Diagonal (m = 1)',
    description: '45-degree line from (1, 1) to (10, 10)',
    data: { x1: 1, y1: 1, x2: 10, y2: 10 },
  },
  {
    name: 'Horizontal Line (m = 0)',
    description: 'Completely horizontal line along y = 6 from (1, 6) to (14, 6)',
    data: { x1: 1, y1: 6, x2: 14, y2: 6 },
  },
  {
    name: 'Vertical Line (m = ∞)',
    description: 'Completely vertical line along x = 7 from (7, 1) to (7, 13)',
    data: { x1: 7, y1: 1, x2: 7, y2: 13 },
  },
  {
    name: 'Negative Slope (-1 < m < 0)',
    description: 'Descending line from (2, 11) to (13, 5)',
    data: { x1: 2, y1: 11, x2: 13, y2: 5 },
  },
  {
    name: 'Steep Negative Slope (m < -1)',
    description: 'Steep descending line from (3, 13) to (7, 2)',
    data: { x1: 3, y1: 13, x2: 7, y2: 2 },
  },
  {
    name: 'Reverse Direction (x1 > x2)',
    description: 'Drawn backwards from right to left (13, 10) to (3, 4)',
    data: { x1: 13, y1: 10, x2: 3, y2: 4 },
  },
];

export const CIRCLE_PRESETS: PresetCase<CircleInputs>[] = [
  {
    name: 'Centered Origin (r = 8)',
    description: 'Radius 8 centered at (0, 0) showcasing 8-way symmetry across axes',
    data: { xc: 0, yc: 0, r: 8 },
  },
  {
    name: 'Offset Circle (r = 6 at (7, 7))',
    description: 'Standard grid center (7, 7) with radius 6',
    data: { xc: 7, yc: 7, r: 6 },
  },
  {
    name: 'Large Circle (r = 12 at (12, 12))',
    description: 'Large high-resolution raster demonstrating smooth circle approximation',
    data: { xc: 12, yc: 12, r: 12 },
  },
  {
    name: 'Compact Circle (r = 4 at (5, 5))',
    description: 'Small radius illustrating integer decision quantization',
    data: { xc: 5, yc: 5, r: 4 },
  },
  {
    name: 'Quadrant II/III Center (-4, 4, r = 7)',
    description: 'Demonstrating negative coordinate handling in coordinate space',
    data: { xc: -4, yc: 4, r: 7 },
  },
];

export const CLIPPING_PRESETS: PresetCase<ClippingInputs>[] = [
  {
    name: 'Partial Clip (Crosses Left & Right)',
    description: 'Line from (1, 4) to (15, 12) passing entirely through the window [3, 11] x [3, 9]',
    data: {
      line: { x1: 1, y1: 4, x2: 15, y2: 12 },
      window: { xmin: 3, xmax: 11, ymin: 3, ymax: 9 },
    },
  },
  {
    name: 'Trivial Accept (Fully Inside)',
    description: 'Line from (4, 4) to (9, 7) inside window [2, 12] x [2, 10]',
    data: {
      line: { x1: 4, y1: 4, x2: 9, y2: 7 },
      window: { xmin: 2, xmax: 12, ymin: 2, ymax: 10 },
    },
  },
  {
    name: 'Trivial Reject (Both on Same Side)',
    description: 'Line from (13, 3) to (16, 9) completely to the right of window [2, 10] x [2, 10]',
    data: {
      line: { x1: 13, y1: 3, x2: 16, y2: 9 },
      window: { xmin: 2, xmax: 10, ymin: 2, ymax: 10 },
    },
  },
  {
    name: 'Corner Diagonal (Clipped by Top & Left)',
    description: 'Line from (1, 12) to (8, 4) clipped by top and left boundaries',
    data: {
      line: { x1: 1, y1: 12, x2: 8, y2: 4 },
      window: { xmin: 3, xmax: 10, ymin: 3, ymax: 9 },
    },
  },
  {
    name: 'Diagonal Miss (Reject via calculation)',
    description: 'Line from (0, 10) to (10, 0) passing near the corner without entering',
    data: {
      line: { x1: 0, y1: 10, x2: 10, y2: 0 },
      window: { xmin: 6, xmax: 12, ymin: 6, ymax: 12 },
    },
  },
  {
    name: 'Vertical Line Clip',
    description: 'Vertical line from (6, 0) to (6, 14) through window [3, 10] x [3, 10]',
    data: {
      line: { x1: 6, y1: 0, x2: 6, y2: 14 },
      window: { xmin: 3, xmax: 10, ymin: 3, ymax: 10 },
    },
  },
];

export const POLYGON_PRESETS: PresetCase<PolygonInputs>[] = [
  {
    name: 'Triangle Straddling Window',
    description: 'A large triangle extending across the top, right, and bottom borders of the clipping window',
    data: {
      vertices: [
        { x: 1, y: 1 },
        { x: 7, y: 13 },
        { x: 13, y: 2 },
      ],
      window: { xmin: 3, xmax: 10, ymin: 3, ymax: 9 },
    },
  },
  {
    name: 'Concave Arrow Shape',
    description: 'An arrow polygon cutting into the window corners',
    data: {
      vertices: [
        { x: 1, y: 6 },
        { x: 8, y: 12 },
        { x: 7, y: 8 },
        { x: 14, y: 8 },
        { x: 14, y: 4 },
        { x: 7, y: 4 },
        { x: 8, y: 0 },
      ],
      window: { xmin: 4, xmax: 11, ymin: 3, ymax: 9 },
    },
  },
  {
    name: 'Fully Inside Diamond',
    description: 'Convex diamond completely contained within the clipping boundary',
    data: {
      vertices: [
        { x: 7, y: 4 },
        { x: 9, y: 6 },
        { x: 7, y: 8 },
        { x: 5, y: 6 },
      ],
      window: { xmin: 3, xmax: 11, ymin: 2, ymax: 10 },
    },
  },
  {
    name: 'Five-Point Star',
    description: 'Multi-vertex star polygon clipping across all four boundaries',
    data: {
      vertices: [
        { x: 7, y: 14 },
        { x: 9, y: 9 },
        { x: 14, y: 9 },
        { x: 10, y: 6 },
        { x: 12, y: 1 },
        { x: 7, y: 4 },
        { x: 2, y: 1 },
        { x: 4, y: 6 },
        { x: 0, y: 9 },
        { x: 5, y: 9 },
      ],
      window: { xmin: 3, xmax: 11, ymin: 3, ymax: 10 },
    },
  },
  {
    name: 'Completely Outside Polygon',
    description: 'Quadrilateral completely to the left of the clipping window',
    data: {
      vertices: [
        { x: 0, y: 2 },
        { x: 2, y: 8 },
        { x: 1, y: 10 },
        { x: -1, y: 5 },
      ],
      window: { xmin: 4, xmax: 12, ymin: 2, ymax: 10 },
    },
  },
];

