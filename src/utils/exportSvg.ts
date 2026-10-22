/**
 * High-Fidelity SVG Generation for Computer Graphics Algorithm Visualizations
 */
import { Point2D, ClippingWindow } from '../types/graphics';

export interface SvgExportOptions {
  title: string;
  subtitle?: string;
  theme?: 'dark' | 'light';
  includeGrid?: boolean;
  includeAxes?: boolean;
  includeIdeal?: boolean;
  includeLabels?: boolean;
  includeBanner?: boolean;
  pixels: Point2D[];
  currentPixel?: Point2D | null;
  octantPoints?: { [key: string]: Point2D } | null;
  comparisonPixels?: Point2D[];
  comparisonLabelA?: string;
  comparisonLabelB?: string;
  idealLine?: { x1: number; y1: number; x2: number; y2: number } | null;
  idealCircle?: { xc: number; yc: number; r: number } | null;
  clippingWindow?: ClippingWindow | null;
  originalSegment?: { x1: number; y1: number; x2: number; y2: number } | null;
  clippedSegment?: { x1: number; y1: number; x2: number; y2: number } | null;
  clipIntersections?: Point2D[];
  originalPolygon?: Point2D[] | null;
  clippedPolygon?: Point2D[] | null;
}

const OCTANT_COLORS = [
  '#38bdf8', // Octant 1: Sky
  '#34d399', // Octant 2: Emerald
  '#a78bfa', // Octant 3: Violet
  '#f472b6', // Octant 4: Pink
  '#fbbf24', // Octant 5: Amber
  '#fb923c', // Octant 6: Orange
  '#2dd4bf', // Octant 7: Teal
  '#818cf8', // Octant 8: Indigo
];

export function generateAlgorithmSvg(options: SvgExportOptions): string {
  const {
    title,
    subtitle = 'Chetan Business School · MCA · Computer Graphics',
    theme = 'dark',
    includeGrid = true,
    includeAxes = true,
    includeIdeal = true,
    includeLabels = true,
    includeBanner = true,
    pixels = [],
    currentPixel = null,
    octantPoints = null,
    comparisonPixels,
    comparisonLabelA = 'DDA',
    comparisonLabelB = 'Bresenham',
    idealLine = null,
    idealCircle = null,
    clippingWindow = null,
    originalSegment = null,
    clippedSegment = null,
    clipIntersections = [],
    originalPolygon = null,
    clippedPolygon = null,
  } = options;

  const isDark = theme === 'dark';

  // Palette definitions
  const colors = {
    bg: isDark ? '#090d16' : '#ffffff',
    bannerBg: isDark ? '#0f172a' : '#f8fafc',
    bannerBorder: isDark ? '#1e293b' : '#e2e8f0',
    titleText: isDark ? '#f8fafc' : '#0f172a',
    subtitleText: isDark ? '#94a3b8' : '#64748b',
    gridMinor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
    gridAxis: isDark ? '#38bdf8' : '#0284c7',
    axisText: isDark ? '#94a3b8' : '#64748b',
    pixelFill: isDark ? 'rgba(14, 165, 233, 0.8)' : 'rgba(2, 132, 199, 0.85)',
    pixelStroke: isDark ? '#0284c7' : '#0369a1',
    activePixelFill: 'rgba(244, 63, 94, 0.4)',
    activePixelStroke: '#f43f5e',
    idealLine: '#f59e0b',
    idealText: isDark ? '#fef08a' : '#b45309',
    clipWindowFill: isDark ? 'rgba(16, 185, 129, 0.09)' : 'rgba(16, 185, 129, 0.12)',
    clipWindowBorder: '#10b981',
    clipGuideline: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.5)',
    clipRejected: isDark ? '#ef4444' : '#dc2626',
    clipAccepted: '#10b981',
    outcodeText: isDark ? '#94a3b8' : '#64748b',
    intersectionDot: '#eab308',
  };

  // Determine coordinate bounding box
  const allPts: Point2D[] = [];
  if (pixels.length > 0) allPts.push(...pixels);
  if (currentPixel) allPts.push(currentPixel);
  if (comparisonPixels) allPts.push(...comparisonPixels);
  if (idealLine) {
    allPts.push({ x: idealLine.x1, y: idealLine.y1 });
    allPts.push({ x: idealLine.x2, y: idealLine.y2 });
  }
  if (idealCircle) {
    allPts.push({ x: idealCircle.xc - idealCircle.r, y: idealCircle.yc - idealCircle.r });
    allPts.push({ x: idealCircle.xc + idealCircle.r, y: idealCircle.yc + idealCircle.r });
  }
  if (clippingWindow) {
    allPts.push({ x: clippingWindow.xmin, y: clippingWindow.ymin });
    allPts.push({ x: clippingWindow.xmax, y: clippingWindow.ymax });
  }
  if (originalSegment) {
    allPts.push({ x: originalSegment.x1, y: originalSegment.y1 });
    allPts.push({ x: originalSegment.x2, y: originalSegment.y2 });
  }
  if (originalPolygon && originalPolygon.length > 0) {
    allPts.push(...originalPolygon);
  }
  if (clippedPolygon && clippedPolygon.length > 0) {
    allPts.push(...clippedPolygon);
  }

  // Fallback points if empty
  if (allPts.length === 0) {
    allPts.push({ x: 0, y: 0 }, { x: 10, y: 10 });
  }

  const rawMinX = Math.min(0, ...allPts.map((p) => p.x));
  const rawMaxX = Math.max(10, ...allPts.map((p) => p.x));
  const rawMinY = Math.min(0, ...allPts.map((p) => p.y));
  const rawMaxY = Math.max(10, ...allPts.map((p) => p.y));

  // Add padding around grid domain
  const gridMinX = Math.floor(rawMinX) - 2;
  const gridMaxX = Math.ceil(rawMaxX) + 2;
  const gridMinY = Math.floor(rawMinY) - 2;
  const gridMaxY = Math.ceil(rawMaxY) + 2;

  const gridUnitsX = gridMaxX - gridMinX;
  const gridUnitsY = gridMaxY - gridMinY;

  const unitSize = 28; // pixels per Cartesian unit
  const gridWidth = gridUnitsX * unitSize;
  const gridHeight = gridUnitsY * unitSize;

  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = includeBanner ? 90 : 35;
  const paddingBottom = 45;

  const svgWidth = gridWidth + paddingLeft + paddingRight;
  const svgHeight = gridHeight + paddingTop + paddingBottom;

  // Convert Cartesian (gx, gy) to SVG coordinates (sx, sy)
  const toSvgX = (gx: number) => paddingLeft + (gx - gridMinX) * unitSize;
  const toSvgY = (gy: number) => paddingTop + (gridMaxY - gy) * unitSize;

  let elements: string[] = [];

  // 1. Background
  elements.push(
    `<rect width="${svgWidth}" height="${svgHeight}" fill="${colors.bg}" rx="12" />`
  );

  // 2. Banner Header
  if (includeBanner) {
    elements.push(`
      <g id="banner">
        <rect x="20" y="16" width="${svgWidth - 40}" height="56" rx="8" fill="${colors.bannerBg}" stroke="${colors.bannerBorder}" stroke-width="1" />
        <circle cx="38" cy="38" r="4" fill="#38bdf8" />
        <text x="50" y="37" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="${colors.titleText}">
          ${escapeXml(title)}
        </text>
        <text x="50" y="55" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${colors.subtitleText}">
          ${escapeXml(subtitle)}
        </text>
        <text x="${svgWidth - 35}" y="47" text-anchor="end" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${colors.subtitleText}">
          Plotted Pixels: ${pixels.length}
        </text>
      </g>
    `);
  }

  // 3. Grid Lines & Axis Numbers
  if (includeGrid) {
    elements.push('<g id="grid-lines">');
    // Vertical grid lines
    for (let x = gridMinX; x <= gridMaxX; x++) {
      const sx = toSvgX(x);
      const isOrigin = x === 0;
      elements.push(
        `<line x1="${sx}" y1="${toSvgY(gridMinY)}" x2="${sx}" y2="${toSvgY(gridMaxY)}" stroke="${
          isOrigin ? colors.gridAxis : colors.gridMinor
        }" stroke-width="${isOrigin ? 2 : 1}" />`
      );

      // Coordinate label on X axis
      if (includeLabels && (x % 2 === 0 || gridUnitsX <= 16)) {
        const sy = Math.min(Math.max(toSvgY(0) + 14, paddingTop + 14), svgHeight - 12);
        elements.push(
          `<text x="${sx}" y="${sy}" font-family="'IBM Plex Mono', monospace" font-size="9" fill="${
            isOrigin ? colors.gridAxis : colors.axisText
          }" text-anchor="middle">${x}</text>`
        );
      }
    }

    // Horizontal grid lines
    for (let y = gridMinY; y <= gridMaxY; y++) {
      const sy = toSvgY(y);
      const isOrigin = y === 0;
      elements.push(
        `<line x1="${toSvgX(gridMinX)}" y1="${sy}" x2="${toSvgX(gridMaxX)}" y2="${sy}" stroke="${
          isOrigin ? colors.gridAxis : colors.gridMinor
        }" stroke-width="${isOrigin ? 2 : 1}" />`
      );

      // Coordinate label on Y axis
      if (includeLabels && y !== 0 && (y % 2 === 0 || gridUnitsY <= 16)) {
        const sx = Math.min(Math.max(toSvgX(0) - 8, 16), svgWidth - 16);
        elements.push(
          `<text x="${sx}" y="${sy + 3}" font-family="'IBM Plex Mono', monospace" font-size="9" fill="${
            isOrigin ? colors.gridAxis : colors.axisText
          }" text-anchor="end">${y}</text>`
        );
      }
    }
    elements.push('</g>');
  }

  // 4. Clipping Window & Region Guidelines
  if (clippingWindow) {
    const { xmin, xmax, ymin, ymax } = clippingWindow;
    const x = toSvgX(xmin);
    const y = toSvgY(ymax);
    const w = (xmax - xmin) * unitSize;
    const h = (ymax - ymin) * unitSize;

    elements.push('<g id="clipping-window">');
    // Window fill & stroke
    elements.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${colors.clipWindowFill}" stroke="${colors.clipWindowBorder}" stroke-width="2" />`
    );

    // Extension guidelines
    elements.push(
      `<line x1="${toSvgX(gridMinX)}" y1="${y}" x2="${toSvgX(gridMaxX)}" y2="${y}" stroke="${colors.clipGuideline}" stroke-width="1" stroke-dasharray="4,4" />`
    );
    elements.push(
      `<line x1="${toSvgX(gridMinX)}" y1="${y + h}" x2="${toSvgX(gridMaxX)}" y2="${y + h}" stroke="${colors.clipGuideline}" stroke-width="1" stroke-dasharray="4,4" />`
    );
    elements.push(
      `<line x1="${x}" y1="${toSvgY(gridMinY)}" x2="${x}" y2="${toSvgY(gridMaxY)}" stroke="${colors.clipGuideline}" stroke-width="1" stroke-dasharray="4,4" />`
    );
    elements.push(
      `<line x1="${x + w}" y1="${toSvgY(gridMinY)}" x2="${x + w}" y2="${toSvgY(gridMaxY)}" stroke="${colors.clipGuideline}" stroke-width="1" stroke-dasharray="4,4" />`
    );

    // 4-bit region annotations
    if (includeLabels) {
      const labels = [
        { text: '1001 (TL)', gx: xmin - 1.5, gy: ymax + 1.2, anchor: 'end' },
        { text: '1000 (TOP)', gx: (xmin + xmax) / 2, gy: ymax + 1.2, anchor: 'middle' },
        { text: '1010 (TR)', gx: xmax + 1.5, gy: ymax + 1.2, anchor: 'start' },
        { text: '0001 (LEFT)', gx: xmin - 1.5, gy: (ymin + ymax) / 2, anchor: 'end' },
        { text: '0000 (WINDOW)', gx: (xmin + xmax) / 2, gy: (ymin + ymax) / 2, anchor: 'middle' },
        { text: '0010 (RIGHT)', gx: xmax + 1.5, gy: (ymin + ymax) / 2, anchor: 'start' },
        { text: '0101 (BL)', gx: xmin - 1.5, gy: ymin - 1.2, anchor: 'end' },
        { text: '0100 (BOTTOM)', gx: (xmin + xmax) / 2, gy: ymin - 1.2, anchor: 'middle' },
        { text: '0110 (BR)', gx: xmax + 1.5, gy: ymin - 1.2, anchor: 'start' },
      ];

      labels.forEach(({ text, gx, gy, anchor }) => {
        elements.push(
          `<text x="${toSvgX(gx)}" y="${toSvgY(gy)}" font-family="'IBM Plex Mono', monospace" font-size="9" fill="${
            text.includes('WINDOW') ? colors.clipAccepted : colors.outcodeText
          }" text-anchor="${anchor}">${text}</text>`
        );
      });
    }
    elements.push('</g>');
  }

  // 5. Plotted Raster Pixels
  if (pixels.length > 0) {
    elements.push('<g id="raster-pixels">');
    const cellSize = unitSize - 2;

    pixels.forEach((p) => {
      const cx = toSvgX(p.x);
      const cy = toSvgY(p.y);
      const px = cx - cellSize / 2;
      const py = cy - cellSize / 2;

      let fill = colors.pixelFill;
      let stroke = colors.pixelStroke;

      // Color symmetry octants if circle mode
      if (octantPoints) {
        const entries = Object.entries(octantPoints);
        for (let i = 0; i < entries.length; i++) {
          const [, pt] = entries[i];
          if (pt.x === p.x && pt.y === p.y) {
            fill = OCTANT_COLORS[i % OCTANT_COLORS.length] + 'cc';
            stroke = OCTANT_COLORS[i % OCTANT_COLORS.length];
            break;
          }
        }
      }

      elements.push(
        `<rect x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1" />`
      );
    });

    // Comparison Mode Secondary Pixels
    if (comparisonPixels && comparisonPixels.length > 0) {
      comparisonPixels.forEach((p) => {
        const cx = toSvgX(p.x);
        const cy = toSvgY(p.y);
        const sz = unitSize - 4;
        elements.push(
          `<rect x="${cx - sz / 2}" y="${cy - sz / 2}" width="${sz}" height="${sz}" rx="2" fill="none" stroke="#f59e0b" stroke-width="2" />`
        );
      });
    }

    elements.push('</g>');
  }

  // 6. Current Active Step Pixel Highlight
  if (currentPixel) {
    const cx = toSvgX(currentPixel.x);
    const cy = toSvgY(currentPixel.y);
    const sz = unitSize - 1;
    elements.push(`
      <g id="active-pixel">
        <rect x="${cx - sz / 2}" y="${cy - sz / 2}" width="${sz}" height="${sz}" rx="2" fill="${colors.activePixelFill}" stroke="${colors.activePixelStroke}" stroke-width="2.5" />
      </g>
    `);
  }

  // 7. Ideal Continuous Geometry
  if (includeIdeal) {
    elements.push('<g id="ideal-geometry">');
    if (idealLine) {
      const x1 = toSvgX(idealLine.x1);
      const y1 = toSvgY(idealLine.y1);
      const x2 = toSvgX(idealLine.x2);
      const y2 = toSvgY(idealLine.y2);

      // Smooth mathematical line
      elements.push(
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors.idealLine}" stroke-width="2" stroke-linecap="round" />`
      );
      // Endpoints
      elements.push(`<circle cx="${x1}" cy="${y1}" r="4" fill="${colors.idealLine}" />`);
      elements.push(`<circle cx="${x2}" cy="${y2}" r="4" fill="${colors.idealLine}" />`);
      if (includeLabels) {
        elements.push(
          `<text x="${x1 + 6}" y="${y1 - 6}" font-family="'IBM Plex Mono', monospace" font-size="9" font-weight="600" fill="${colors.idealText}">P1(${idealLine.x1},${idealLine.y1})</text>`
        );
        elements.push(
          `<text x="${x2 + 6}" y="${y2 - 6}" font-family="'IBM Plex Mono', monospace" font-size="9" font-weight="600" fill="${colors.idealText}">P2(${idealLine.x2},${idealLine.y2})</text>`
        );
      }
    }

    if (idealCircle) {
      const cx = toSvgX(idealCircle.xc);
      const cy = toSvgY(idealCircle.yc);
      const rPx = idealCircle.r * unitSize;

      elements.push(
        `<circle cx="${cx}" cy="${cy}" r="${rPx}" fill="none" stroke="${colors.idealLine}" stroke-width="1.8" />`
      );
      elements.push(`<circle cx="${cx}" cy="${cy}" r="4" fill="${colors.idealLine}" />`);
      if (includeLabels) {
        elements.push(
          `<text x="${cx + 6}" y="${cy - 6}" font-family="'IBM Plex Mono', monospace" font-size="9" font-weight="600" fill="${colors.idealText}">C(${idealCircle.xc},${idealCircle.yc}), r=${idealCircle.r}</text>`
        );
      }
    }
    elements.push('</g>');
  }

  // 8. Clipping Segments (Original dashed & Clipped solid)
  if (originalSegment) {
    const x1 = toSvgX(originalSegment.x1);
    const y1 = toSvgY(originalSegment.y1);
    const x2 = toSvgX(originalSegment.x2);
    const y2 = toSvgY(originalSegment.y2);

    elements.push('<g id="clipping-segments">');
    // Dashed unclipped line
    elements.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors.clipRejected}" stroke-width="2" stroke-dasharray="5,5" />`
    );
    elements.push(`<circle cx="${x1}" cy="${y1}" r="3.5" fill="${colors.clipRejected}" />`);
    elements.push(`<circle cx="${x2}" cy="${y2}" r="3.5" fill="${colors.clipRejected}" />`);

    if (clippedSegment) {
      const cx1 = toSvgX(clippedSegment.x1);
      const cy1 = toSvgY(clippedSegment.y1);
      const cx2 = toSvgX(clippedSegment.x2);
      const cy2 = toSvgY(clippedSegment.y2);

      // Solid accepted segment
      elements.push(
        `<line x1="${cx1}" y1="${cy1}" x2="${cx2}" y2="${cy2}" stroke="${colors.clipAccepted}" stroke-width="3.5" stroke-linecap="round" />`
      );
      elements.push(`<circle cx="${cx1}" cy="${cy1}" r="4.5" fill="${colors.clipAccepted}" />`);
      elements.push(`<circle cx="${cx2}" cy="${cy2}" r="4.5" fill="${colors.clipAccepted}" />`);
      if (includeLabels) {
        elements.push(
          `<text x="${cx1 + 8}" y="${cy1 - 6}" font-family="'IBM Plex Mono', monospace" font-size="10" font-weight="700" fill="${colors.clipAccepted}">P1'(${clippedSegment.x1},${clippedSegment.y1})</text>`
        );
        elements.push(
          `<text x="${cx2 + 8}" y="${cy2 - 6}" font-family="'IBM Plex Mono', monospace" font-size="10" font-weight="700" fill="${colors.clipAccepted}">P2'(${clippedSegment.x2},${clippedSegment.y2})</text>`
        );
      }
    }

    // Intersections
    if (clipIntersections.length > 0) {
      clipIntersections.forEach((pt, idx) => {
        const ix = toSvgX(pt.x);
        const iy = toSvgY(pt.y);
        elements.push(
          `<circle cx="${ix}" cy="${iy}" r="4" fill="${colors.intersectionDot}" stroke="#ffffff" stroke-width="1.5" />`
        );
        if (includeLabels) {
          elements.push(
            `<text x="${ix + 6}" y="${iy - 6}" font-family="'IBM Plex Mono', monospace" font-size="9" fill="${colors.intersectionDot}">I${idx + 1}(${pt.x},${pt.y})</text>`
          );
        }
      });
    }
    elements.push('</g>');
  }

  // 9. Polygon Clipping Rendering (Original & Clipped)
  if (originalPolygon && originalPolygon.length >= 3) {
    elements.push('<g id="polygon-clipping">');
    const origPointsStr = originalPolygon.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');
    elements.push(
      `<polygon points="${origPointsStr}" fill="${isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.1)'}" stroke="${colors.clipRejected}" stroke-width="2" stroke-dasharray="5,5" />`
    );

    originalPolygon.forEach((v, idx) => {
      const vx = toSvgX(v.x);
      const vy = toSvgY(v.y);
      elements.push(`<circle cx="${vx}" cy="${vy}" r="3.5" fill="${colors.clipRejected}" />`);
      if (includeLabels) {
        elements.push(
          `<text x="${vx + 6}" y="${vy - 6}" font-family="'IBM Plex Mono', monospace" font-size="9" fill="${colors.clipRejected}">V${idx + 1}(${v.x},${v.y})</text>`
        );
      }
    });

    if (clippedPolygon && clippedPolygon.length >= 3) {
      const clipPointsStr = clippedPolygon.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ');
      elements.push(
        `<polygon points="${clipPointsStr}" fill="${isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.35)'}" stroke="${colors.clipAccepted}" stroke-width="3" />`
      );

      clippedPolygon.forEach((v, idx) => {
        const vx = toSvgX(v.x);
        const vy = toSvgY(v.y);
        elements.push(`<circle cx="${vx}" cy="${vy}" r="4.5" fill="${colors.clipAccepted}" />`);
        if (includeLabels) {
          elements.push(
            `<text x="${vx + 7}" y="${vy - 6}" font-family="'IBM Plex Mono', monospace" font-size="10" font-weight="700" fill="${colors.clipAccepted}">P${idx + 1}(${v.x},${v.y})</text>`
          );
        }
      });
    }
    elements.push('</g>');
  }

  // Assemble full SVG string
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&amp;family=Plus+Jakarta+Sans:wght@700&amp;display=swap');
    </style>
  </defs>
  ${elements.join('\n  ')}
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadSvgFile(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
