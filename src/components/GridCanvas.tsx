/**
 * Interactive HTML5 Canvas Coordinate Grid for Computer Graphics Rasterization
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point2D, ClippingWindow } from '../types/graphics';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Crosshair, Eye, EyeOff, FileDown } from 'lucide-react';

interface GridCanvasProps {
  // Raster pixels to display
  pixels?: Point2D[];
  currentPixel?: Point2D | null;
  // Symmetrical circle octants if circle mode
  octantPoints?: { [key: string]: Point2D } | null;
  // Ideal continuous geometry overlay
  idealLine?: { x1: number; y1: number; x2: number; y2: number } | null;
  idealCircle?: { xc: number; yc: number; r: number } | null;
  // Clipping window and segments
  clippingWindow?: ClippingWindow | null;
  originalSegment?: { x1: number; y1: number; x2: number; y2: number } | null;
  clippedSegment?: { x1: number; y1: number; x2: number; y2: number } | null;
  clipIntersections?: Point2D[];
  showOutcodeLabels?: boolean;
  // Polygon clipping props
  originalPolygon?: Point2D[] | null;
  clippedPolygon?: Point2D[] | null;
  stagePolygon?: Point2D[] | null;
  activeEdge?: { s: Point2D; p: Point2D } | null;
  // Interactivity
  onPointSelect?: (point: Point2D) => void;
  // Export SVG callback
  onExportSvg?: () => void;
  // Optional secondary pixels for comparison mode
  comparisonPixels?: Point2D[];
  comparisonLabelA?: string;
  comparisonLabelB?: string;
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

export const GridCanvas: React.FC<GridCanvasProps> = ({
  pixels = [],
  currentPixel = null,
  octantPoints = null,
  idealLine = null,
  idealCircle = null,
  clippingWindow = null,
  originalSegment = null,
  clippedSegment = null,
  clipIntersections = [],
  showOutcodeLabels = true,
  originalPolygon = null,
  clippedPolygon = null,
  stagePolygon = null,
  activeEdge = null,
  onPointSelect,
  onExportSvg,
  comparisonPixels,
  comparisonLabelA = 'DDA',
  comparisonLabelB = 'Bresenham',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport transforms
  const [scale, setScale] = useState<number>(24); // pixels per grid unit
  const [originOffset, setOriginOffset] = useState<Point2D>({ x: 120, y: 380 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Point2D>({ x: 0, y: 0 });
  const [hoveredCoord, setHoveredCoord] = useState<Point2D | null>(null);
  const [showIdeal, setShowIdeal] = useState<boolean>(true);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [colorSymmetry, setColorSymmetry] = useState<boolean>(true);

  // Auto-fit to contents on initial mount or when geometry changes substantially
  const centerOnGeometry = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // Collect all points of interest
    const pts: Point2D[] = [];
    if (pixels) pts.push(...pixels);
    if (idealLine) {
      pts.push({ x: idealLine.x1, y: idealLine.y1 });
      pts.push({ x: idealLine.x2, y: idealLine.y2 });
    }
    if (idealCircle) {
      pts.push({ x: idealCircle.xc - idealCircle.r - 2, y: idealCircle.yc - idealCircle.r - 2 });
      pts.push({ x: idealCircle.xc + idealCircle.r + 2, y: idealCircle.yc + idealCircle.r + 2 });
    }
    if (clippingWindow) {
      pts.push({ x: clippingWindow.xmin - 3, y: clippingWindow.ymin - 3 });
      pts.push({ x: clippingWindow.xmax + 3, y: clippingWindow.ymax + 3 });
    }
    if (originalSegment) {
      pts.push({ x: originalSegment.x1, y: originalSegment.y1 });
      pts.push({ x: originalSegment.x2, y: originalSegment.y2 });
    }
    if (originalPolygon && originalPolygon.length > 0) {
      pts.push(...originalPolygon);
    }
    if (clippedPolygon && clippedPolygon.length > 0) {
      pts.push(...clippedPolygon);
    }

    if (pts.length === 0) {
      setOriginOffset({ x: width * 0.25, y: height * 0.75 });
      setScale(24);
      return;
    }

    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));

    const spanX = Math.max(12, maxX - minX + 6);
    const spanY = Math.max(12, maxY - minY + 6);

    const fitScale = Math.min(
      Math.max(14, Math.min(width / (spanX + 4), height / (spanY + 4))),
      44
    );

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const screenCenterX = width / 2;
    const screenCenterY = height / 2;

    const newOffsetX = screenCenterX - midX * fitScale;
    const newOffsetY = screenCenterY + midY * fitScale;

    setScale(fitScale);
    setOriginOffset({ x: newOffsetX, y: newOffsetY });
  }, [pixels, idealLine, idealCircle, clippingWindow, originalSegment]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial centering
  useEffect(() => {
    const timer = setTimeout(() => {
      centerOnGeometry();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Convert Grid (Cartesian) to Canvas Screen coordinates
  const gridToScreen = useCallback(
    (gx: number, gy: number) => {
      return {
        x: originOffset.x + gx * scale,
        y: originOffset.y - gy * scale,
      };
    },
    [originOffset, scale]
  );

  // Convert Canvas Screen coordinates to Grid (Cartesian) unit coordinates
  const screenToGrid = useCallback(
    (sx: number, sy: number) => {
      return {
        x: Math.round((sx - originOffset.x) / scale),
        y: Math.round((originOffset.y - sy) / scale),
      };
    },
    [originOffset, scale]
  );

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#090d16'; // Deep space slate
    ctx.fillRect(0, 0, width, height);

    // Visible grid range
    const startX = Math.floor(-originOffset.x / scale) - 2;
    const endX = Math.ceil((width - originOffset.x) / scale) + 2;
    const startY = Math.floor((originOffset.y - height) / scale) - 2;
    const endY = Math.ceil(originOffset.y / scale) + 2;

    // Draw grid lines
    ctx.lineWidth = 1;
    for (let x = startX; x <= endX; x++) {
      const scr = gridToScreen(x, 0);
      ctx.strokeStyle = x === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = x === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(scr.x, 0);
      ctx.lineTo(scr.x, height);
      ctx.stroke();

      // Axis labels
      if (showCoordinates && scale >= 16 && (x % (scale < 24 ? 2 : 1) === 0)) {
        ctx.fillStyle = x === 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.6)';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${x}`, scr.x, Math.min(Math.max(originOffset.y + 14, 16), height - 6));
      }
    }

    for (let y = startY; y <= endY; y++) {
      const scr = gridToScreen(0, y);
      ctx.strokeStyle = y === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = y === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(0, scr.y);
      ctx.lineTo(width, scr.y);
      ctx.stroke();

      // Axis labels
      if (showCoordinates && showCoordinates && scale >= 16 && y !== 0 && (y % (scale < 24 ? 2 : 1) === 0)) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${y}`, Math.min(Math.max(originOffset.x - 8, 22), width - 6), scr.y + 3);
      }
    }

    // Origin indicator
    const origin = gridToScreen(0, 0);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // 1. Draw Clipping Window Regions if active
    if (clippingWindow) {
      const { xmin, xmax, ymin, ymax } = clippingWindow;
      const topLeft = gridToScreen(xmin, ymax);
      const bottomRight = gridToScreen(xmax, ymin);
      const winW = (xmax - xmin) * scale;
      const winH = (ymax - ymin) * scale;

      // Fill inside clipping window
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)'; // Soft Emerald
      ctx.fillRect(topLeft.x, topLeft.y, winW, winH);

      // Clipping window border
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(topLeft.x, topLeft.y, winW, winH);

      // Boundary boundary extension guide lines
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1;
      // Top guideline
      ctx.beginPath();
      ctx.moveTo(0, topLeft.y);
      ctx.lineTo(width, topLeft.y);
      // Bottom guideline
      ctx.moveTo(0, bottomRight.y);
      ctx.lineTo(width, bottomRight.y);
      // Left guideline
      ctx.moveTo(topLeft.x, 0);
      ctx.lineTo(topLeft.x, height);
      // Right guideline
      ctx.moveTo(bottomRight.x, 0);
      ctx.lineTo(bottomRight.x, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outcode region 4-bit annotations
      if (showOutcodeLabels) {
        ctx.font = '11px "IBM Plex Mono", monospace';
        const labels = [
          { text: '1001 (TL)', x: xmin - 2, y: ymax + 2, align: 'right' },
          { text: '1000 (TOP)', x: (xmin + xmax) / 2, y: ymax + 2, align: 'center' },
          { text: '1010 (TR)', x: xmax + 2, y: ymax + 2, align: 'left' },
          { text: '0001 (LEFT)', x: xmin - 2, y: (ymin + ymax) / 2, align: 'right' },
          { text: '0000 (WINDOW)', x: (xmin + xmax) / 2, y: (ymin + ymax) / 2, align: 'center' },
          { text: '0010 (RIGHT)', x: xmax + 2, y: (ymin + ymax) / 2, align: 'left' },
          { text: '0101 (BL)', x: xmin - 2, y: ymin - 2, align: 'right' },
          { text: '0100 (BOTTOM)', x: (xmin + xmax) / 2, y: ymin - 2, align: 'center' },
          { text: '0110 (BR)', x: xmax + 2, y: ymin - 2, align: 'left' },
        ];

        labels.forEach(({ text, x, y, align }) => {
          const pt = gridToScreen(x, y);
          ctx.fillStyle = text.includes('WINDOW') ? '#34d399' : 'rgba(148, 163, 184, 0.7)';
          ctx.textAlign = align as CanvasTextAlign;
          ctx.fillText(text, pt.x, pt.y);
        });
      }
    }

    // 2. Render Plotted Raster Pixels
    // Comparison Mode Dual Render
    if (comparisonPixels && comparisonPixels.length > 0) {
      // Comparison set A (e.g. DDA) - Top-Left triangle or hollow
      pixels.forEach((p) => {
        const pt = gridToScreen(p.x, p.y);
        const cellW = scale - 2;
        const cellH = scale - 2;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)'; // Sky
        ctx.fillRect(pt.x - cellW / 2, pt.y - cellH / 2, cellW, cellH);
      });

      // Comparison set B (e.g. Bresenham) - Inner amber border or overlay
      comparisonPixels.forEach((p) => {
        const pt = gridToScreen(p.x, p.y);
        const cellW = scale - 4;
        const cellH = scale - 4;
        ctx.strokeStyle = '#f59e0b'; // Amber outline
        ctx.lineWidth = 2;
        ctx.strokeRect(pt.x - cellW / 2, pt.y - cellH / 2, cellW, cellH);
      });
    } else {
      // Standard raster pixel render
      pixels.forEach((p) => {
        const pt = gridToScreen(p.x, p.y);
        const cellW = scale - 2;
        const cellH = scale - 2;

        let fillColor = 'rgba(14, 165, 233, 0.75)'; // Electric Cyan
        let borderColor = '#0284c7';

        // Check if circle octants are mapped
        if (octantPoints && colorSymmetry) {
          // determine if belongs to a specific octant
          const octantEntries = Object.entries(octantPoints);
          for (let i = 0; i < octantEntries.length; i++) {
            const [, symPt] = octantEntries[i];
            if (symPt.x === p.x && symPt.y === p.y) {
              fillColor = OCTANT_COLORS[i % OCTANT_COLORS.length] + 'cc';
              borderColor = OCTANT_COLORS[i % OCTANT_COLORS.length];
              break;
            }
          }
        }

        ctx.fillStyle = fillColor;
        ctx.fillRect(pt.x - cellW / 2, pt.y - cellH / 2, cellW, cellH);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(pt.x - cellW / 2, pt.y - cellH / 2, cellW, cellH);
      });
    }

    // 3. Highlight Current Step Pixel
    if (currentPixel) {
      const pt = gridToScreen(currentPixel.x, currentPixel.y);
      const cellW = scale - 1;
      const cellH = scale - 1;

      // Glowing outer ring
      ctx.strokeStyle = '#f43f5e'; // Vibrant Rose
      ctx.lineWidth = 2.5;
      ctx.strokeRect(pt.x - cellW / 2, pt.y - cellH / 2, cellW, cellH);

      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.fillRect(pt.x - cellW / 2, pt.y - cellH / 2, cellW, cellH);
    }

    // 4. Render Ideal Continuous Mathematical Overlay (if enabled)
    if (showIdeal) {
      if (idealLine) {
        const p1 = gridToScreen(idealLine.x1, idealLine.y1);
        const p2 = gridToScreen(idealLine.x2, idealLine.y2);

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)'; // Amber continuous line
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Endpoints
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
        ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Endpoint labels
        ctx.fillStyle = '#fef08a';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`P1(${idealLine.x1},${idealLine.y1})`, p1.x + 6, p1.y - 6);
        ctx.fillText(`P2(${idealLine.x2},${idealLine.y2})`, p2.x + 6, p2.y - 6);
      }

      if (idealCircle) {
        const center = gridToScreen(idealCircle.xc, idealCircle.yc);
        const radiusPx = idealCircle.r * scale;

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)'; // Amber ideal circle
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radiusPx, 0, Math.PI * 2);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`C(${idealCircle.xc},${idealCircle.yc}), r=${idealCircle.r}`, center.x + 6, center.y - 6);
      }
    }

    // 5. Render Clipping Segments (Original vs Clipped)
    if (originalSegment) {
      const p1 = gridToScreen(originalSegment.x1, originalSegment.y1);
      const p2 = gridToScreen(originalSegment.x2, originalSegment.y2);

      // Draw full original line as subtle dashed red/gray line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)'; // Red/Rejected segment
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Original endpoints
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
      ctx.arc(p2.x, p2.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fca5a5';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`P1(${originalSegment.x1},${originalSegment.y1})`, p1.x + 6, p1.y - 6);
      ctx.fillText(`P2(${originalSegment.x2},${originalSegment.y2})`, p2.x + 6, p2.y - 6);
    }

    if (clippedSegment) {
      const cp1 = gridToScreen(clippedSegment.x1, clippedSegment.y1);
      const cp2 = gridToScreen(clippedSegment.x2, clippedSegment.y2);

      // Solid vibrant green accepted line
      ctx.strokeStyle = '#10b981'; // Emerald
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cp1.x, cp1.y);
      ctx.lineTo(cp2.x, cp2.y);
      ctx.stroke();

      // Accepted endpoints
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(cp1.x, cp1.y, 5, 0, Math.PI * 2);
      ctx.arc(cp2.x, cp2.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 11px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`P1'(${clippedSegment.x1},${clippedSegment.y1})`, cp1.x + 8, cp1.y - 6);
      ctx.fillText(`P2'(${clippedSegment.x2},${clippedSegment.y2})`, cp2.x + 8, cp2.y - 6);
    }

    // Intersections markers
    if (clipIntersections && clipIntersections.length > 0) {
      clipIntersections.forEach((pt, i) => {
        const scr = gridToScreen(pt.x, pt.y);
        ctx.fillStyle = '#eab308'; // Golden yellow
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`I${i + 1}(${pt.x},${pt.y})`, scr.x + 6, scr.y - 6);
      });
    }

    // 5b. Render Subject & Clipped Polygons (Sutherland-Hodgman)
    if (originalPolygon && originalPolygon.length >= 3) {
      // Draw unclipped original polygon with dashed red outline and subtle red fill
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const firstScr = gridToScreen(originalPolygon[0].x, originalPolygon[0].y);
      ctx.moveTo(firstScr.x, firstScr.y);
      for (let i = 1; i < originalPolygon.length; i++) {
        const pScr = gridToScreen(originalPolygon[i].x, originalPolygon[i].y);
        ctx.lineTo(pScr.x, pScr.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw original vertices
      originalPolygon.forEach((v, idx) => {
        const vScr = gridToScreen(v.x, v.y);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(vScr.x, vScr.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fca5a5';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`V${idx + 1}(${v.x},${v.y})`, vScr.x + 6, vScr.y - 6);
      });
    }

    if (clippedPolygon && clippedPolygon.length >= 3) {
      // Draw clipped polygon with solid vibrant emerald border and emerald fill
      ctx.strokeStyle = '#10b981';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const firstScr = gridToScreen(clippedPolygon[0].x, clippedPolygon[0].y);
      ctx.moveTo(firstScr.x, firstScr.y);
      for (let i = 1; i < clippedPolygon.length; i++) {
        const pScr = gridToScreen(clippedPolygon[i].x, clippedPolygon[i].y);
        ctx.lineTo(pScr.x, pScr.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Clipped vertices
      clippedPolygon.forEach((v, idx) => {
        const vScr = gridToScreen(v.x, v.y);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(vScr.x, vScr.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6ee7b7';
        ctx.font = 'bold 11px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`P${idx + 1}(${v.x},${v.y})`, vScr.x + 7, vScr.y - 6);
      });
    }

    // Highlight active edge during step-by-step polygon clipping
    if (activeEdge) {
      const sScr = gridToScreen(activeEdge.s.x, activeEdge.s.y);
      const pScr = gridToScreen(activeEdge.p.x, activeEdge.p.y);
      ctx.strokeStyle = '#38bdf8'; // Sky blue
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(sScr.x, sScr.y);
      ctx.lineTo(pScr.x, pScr.y);
      ctx.stroke();

      // S and P endpoint rings
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(sScr.x, sScr.y, 5, 0, Math.PI * 2);
      ctx.arc(pScr.x, pScr.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 10px "IBM Plex Mono", monospace';
      ctx.fillText(`S`, sScr.x - 12, sScr.y - 6);
      ctx.fillText(`P`, pScr.x + 8, pScr.y - 6);
    }

    // 6. Hovered Cell Preview
    if (hoveredCoord) {
      const scr = gridToScreen(hoveredCoord.x, hoveredCoord.y);
      const cellW = scale;
      const cellH = scale;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(scr.x - cellW / 2, scr.y - cellH / 2, cellW, cellH);
    }
  }, [
    scale,
    originOffset,
    pixels,
    currentPixel,
    octantPoints,
    idealLine,
    idealCircle,
    clippingWindow,
    originalSegment,
    clippedSegment,
    clipIntersections,
    originalPolygon,
    clippedPolygon,
    stagePolygon,
    activeEdge,
    showIdeal,
    showCoordinates,
    showOutcodeLabels,
    colorSymmetry,
    hoveredCoord,
    comparisonPixels,
    gridToScreen,
  ]);

  // Mouse Handlers for Pan & Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - originOffset.x, y: e.clientY - originOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (isDragging) {
      setOriginOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      const gridPt = screenToGrid(sx, sy);
      setHoveredCoord(gridPt);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    const newScale = Math.min(Math.max(scale * zoomFactor, 10), 64);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom towards mouse pointer
      const newOffsetX = mouseX - (mouseX - originOffset.x) * (newScale / scale);
      const newOffsetY = mouseY - (mouseY - originOffset.y) * (newScale / scale);

      setScale(newScale);
      setOriginOffset({ x: newOffsetX, y: newOffsetY });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPointSelect || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const gridPt = screenToGrid(sx, sy);
    onPointSelect(gridPt);
  };

  // Touch Support for Phones & Tablets (Pan, Pinch-to-Zoom, Coordinate Select)
  const pinchDistRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - originOffset.x, y: touch.clientY - originOffset.y });
      setIsDragging(true);

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;
        setHoveredCoord(screenToGrid(sx, sy));
      }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setOriginOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;
        setHoveredCoord(screenToGrid(sx, sy));
      }
    } else if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / pinchDistRef.current;
      if (Math.abs(factor - 1) > 0.03) {
        const newScale = Math.min(Math.max(scale * (factor > 1 ? 1.04 : 0.96), 10), 64);
        setScale(newScale);
        pinchDistRef.current = dist;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      pinchDistRef.current = null;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[320px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[560px] bg-slate-950 overflow-hidden flex flex-col select-none rounded-lg border border-slate-800">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setHoveredCoord(null);
        }}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full h-full block touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
      />

      {/* Floating Toolbar Controls */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-md border border-slate-700/60 shadow-lg text-slate-300 z-10">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.25, 64))}
          title="Zoom In"
          className="p-1 sm:p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.8, 10))}
          title="Zoom Out"
          className="p-1 sm:p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={centerOnGeometry}
          title="Center & Fit View"
          className="p-1 sm:p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
          aria-label="Center View"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <div className="w-[1px] h-3.5 sm:h-4 bg-slate-700 mx-0.5" />
        <button
          onClick={() => setShowIdeal(!showIdeal)}
          title={showIdeal ? 'Hide Ideal Geometry' : 'Show Ideal Geometry'}
          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-mono rounded flex items-center gap-1 transition-colors ${
            showIdeal ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-slate-800'
          }`}
          aria-label="Toggle Ideal Geometry"
        >
          {showIdeal ? <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          <span className="hidden sm:inline">Ideal</span>
        </button>
        <button
          onClick={() => setShowCoordinates(!showCoordinates)}
          title="Toggle Axis Numbers"
          className={`p-1 sm:p-1.5 rounded transition-colors ${
            showCoordinates ? 'text-sky-400 bg-sky-500/10' : 'hover:bg-slate-800'
          }`}
          aria-label="Toggle Coordinates"
        >
          <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        {onExportSvg && (
          <>
            <div className="w-[1px] h-3.5 sm:h-4 bg-slate-700 mx-0.5" />
            <button
              onClick={onExportSvg}
              title="Export Current Path as SVG Vector Graphic"
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-mono font-medium rounded flex items-center gap-1 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors"
              aria-label="Export SVG"
            >
              <FileDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>SVG</span>
            </button>
          </>
        )}
      </div>

      {/* Coordinate & Status Pill */}
      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-900/90 backdrop-blur-md rounded-md border border-slate-700/60 text-[10px] sm:text-xs font-mono text-slate-300 pointer-events-none max-w-[calc(100%-16px)] truncate z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{hoveredCoord ? `(${hoveredCoord.x}, ${hoveredCoord.y})` : 'Touch/hover'}</span>
        </span>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-400 hidden sm:inline">{Math.round(scale)}px/u</span>
        {pixels.length > 0 && (
          <>
            <span className="text-slate-500">|</span>
            <span className="text-sky-400 font-medium">{pixels.length} px</span>
          </>
        )}
      </div>

      {/* Legend Indicator - positioned responsive */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 hidden sm:flex flex-wrap items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-slate-900/80 backdrop-blur-md rounded-md border border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-300 pointer-events-none z-10 max-w-[60%] sm:max-w-none">
        {comparisonPixels ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/80 inline-block" />
              {comparisonLabelA}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-amber-500 inline-block" />
              {comparisonLabelB}
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-sky-500 inline-block" />
              Raster
            </span>
            {currentPixel && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-rose-500 inline-block" />
                Active
              </span>
            )}
            {showIdeal && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                Math
              </span>
            )}
            {clippingWindow && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 border border-emerald-500 bg-emerald-500/10 inline-block" />
                Clip
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
