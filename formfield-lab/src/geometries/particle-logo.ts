import type { GeometryDefinition } from "@/geometries/types";

const FALLBACK_WORD = "FORMFIELD";
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 320;
const TARGET_WIDTH = 410;
const TARGET_HEIGHT = 132;
const SAMPLE_STEP = 3;
const DEPTH = 18;
const DEFAULT_ROTATION_X = 0.5;
const DEFAULT_ROTATION_Y = -0.5;

const GLYPHS: Record<string, readonly string[]> = {
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"]
};

interface PixelCell {
  x: number;
  y: number;
}

let cachedKey = "";
let cachedCells: readonly PixelCell[] = [];

export const particleLogoGeometry: GeometryDefinition = {
  id: "particle-logo",
  label: "文字标志",
  ariaLabel: "由星点聚合形成的自定义中英文三维文字标志",
  mark: "particle-logo",
  sample(positions, pointSizes, { phase, columns, rows, text = FALLBACK_WORD }) {
    const cells = resolveCells(text);
    const pointCount = columns * rows;

    for (let index = 0; index < pointCount; index += 1) {
      const cellIndex = Math.floor(index / pointCount * cells.length);
      const cell = cells[Math.min(cellIndex, cells.length - 1)];
      const positionIndex = index * 3;
      const jitterX = (hash(index * 19 + 7) - 0.5) * 2.2;
      const jitterY = (hash(index * 29 + 11) - 0.5) * 2.2;
      const depth = (hash(index * 83 + 23) - 0.5) * DEPTH
        + Math.sin(phase * 1.15 + cell.x * 0.035) * 1.8;
      const oriented = orientForDefaultView(cell.x + jitterX, cell.y + jitterY, depth);

      positions[positionIndex] = oriented[0];
      positions[positionIndex + 1] = oriented[1];
      positions[positionIndex + 2] = oriented[2];
      pointSizes[index] = 0.48 + hash(index * 41 + 17) * 0.46;
    }
  }
};

function resolveCells(text: string): readonly PixelCell[] {
  const normalized = text.trim() || FALLBACK_WORD;
  const mode = typeof document === "undefined" ? "fallback" : "canvas";
  const key = `${mode}:${normalized}`;
  if (key === cachedKey && cachedCells.length > 0) return cachedCells;

  cachedKey = key;
  cachedCells = mode === "canvas"
    ? createCanvasCells(normalized)
    : createFallbackCells();

  if (cachedCells.length === 0) cachedCells = createFallbackCells();
  return cachedCells;
}

function createCanvasCells(text: string): PixelCell[] {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return createFallbackCells();

  const fontFamily = '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif';
  let fontSize = 220;
  context.font = `800 ${fontSize}px ${fontFamily}`;
  const measuredWidth = context.measureText(text).width;
  fontSize = Math.min(fontSize, fontSize * (CANVAS_WIDTH - 80) / Math.max(1, measuredWidth));
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = "#fff";
  context.font = `800 ${fontSize}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

  const pixels = context.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
  const rawCells: PixelCell[] = [];
  let minimumX = CANVAS_WIDTH;
  let maximumX = 0;
  let minimumY = CANVAS_HEIGHT;
  let maximumY = 0;

  for (let y = 0; y < CANVAS_HEIGHT; y += SAMPLE_STEP) {
    for (let x = 0; x < CANVAS_WIDTH; x += SAMPLE_STEP) {
      if (pixels[(y * CANVAS_WIDTH + x) * 4 + 3] < 96) continue;
      rawCells.push({ x, y });
      minimumX = Math.min(minimumX, x);
      maximumX = Math.max(maximumX, x);
      minimumY = Math.min(minimumY, y);
      maximumY = Math.max(maximumY, y);
    }
  }

  if (rawCells.length === 0) return createFallbackCells();
  const width = Math.max(1, maximumX - minimumX);
  const height = Math.max(1, maximumY - minimumY);
  const scale = Math.min(TARGET_WIDTH / width, TARGET_HEIGHT / height);
  const centerX = (minimumX + maximumX) * 0.5;
  const centerY = (minimumY + maximumY) * 0.5;

  return rawCells.map((cell) => ({
    x: (cell.x - centerX) * scale,
    y: (centerY - cell.y) * scale
  }));
}

function createFallbackCells(): PixelCell[] {
  const cells: PixelCell[] = [];
  const cellSize = 7.8;
  const letterAdvance = 6;
  const totalWidth = (FALLBACK_WORD.length * letterAdvance - 1) * cellSize;

  [...FALLBACK_WORD].forEach((letter, letterIndex) => {
    const glyph = GLYPHS[letter];
    glyph.forEach((line, row) => {
      [...line].forEach((pixel, column) => {
        if (pixel === "1") {
          cells.push({
            x: (letterIndex * letterAdvance + column) * cellSize - totalWidth * 0.5,
            y: (3 - row) * cellSize
          });
        }
      });
    });
  });
  return cells;
}

function orientForDefaultView(
  screenX: number,
  screenY: number,
  screenZ: number
): readonly [number, number, number] {
  const cosX = Math.cos(DEFAULT_ROTATION_X);
  const sinX = Math.sin(DEFAULT_ROTATION_X);
  const cosY = Math.cos(DEFAULT_ROTATION_Y);
  const sinY = Math.sin(DEFAULT_ROTATION_Y);
  const y = -screenY * cosX + screenZ * sinX;
  const intermediateZ = screenY * sinX + screenZ * cosX;
  const x = screenX * cosY - intermediateZ * sinY;
  const z = screenX * sinY + intermediateZ * cosY;
  return [x, y, z];
}

function hash(value: number): number {
  const result = Math.sin(value * 12.9898) * 43758.5453;
  return result - Math.floor(result);
}
