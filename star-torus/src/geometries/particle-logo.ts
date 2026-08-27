import type { GeometryDefinition } from "@/geometries/types";

const WORD = "FORMFIELD";
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

const CELL_SIZE = 7.8;
const LETTER_ADVANCE = 6;
const DEPTH = 20;

interface PixelCell {
  x: number;
  y: number;
}

const CELLS = createCells();

export const particleLogoGeometry: GeometryDefinition = {
  id: "particle-logo",
  label: "文字标志",
  ariaLabel: "由星点聚合形成的 FORMFIELD 三维文字标志",
  mark: "particle-logo",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const pointCount = columns * rows;
    const totalWidth = (WORD.length * LETTER_ADVANCE - 1) * CELL_SIZE;

    for (let index = 0; index < pointCount; index += 1) {
      const cell = CELLS[index % CELLS.length];
      const layer = Math.floor(index / CELLS.length);
      const positionIndex = index * 3;
      const jitterX = (hash(index * 19 + 7) - 0.5) * CELL_SIZE * 0.72;
      const jitterY = (hash(index * 29 + 11) - 0.5) * CELL_SIZE * 0.72;
      const depthProgress = hash(layer * 83 + index * 3);
      const breathing = Math.sin(phase * 1.4 + cell.x * 0.22 + cell.y * 0.31) * 2.2;

      positions[positionIndex] = cell.x * CELL_SIZE - totalWidth * 0.5 + jitterX;
      positions[positionIndex + 1] = (3 - cell.y) * CELL_SIZE + jitterY;
      positions[positionIndex + 2] = (depthProgress - 0.5) * DEPTH + breathing;
      pointSizes[index] = 0.5 + hash(index * 41 + 17) * 0.48;
    }
  }
};

function createCells(): PixelCell[] {
  const cells: PixelCell[] = [];
  [...WORD].forEach((letter, letterIndex) => {
    const glyph = GLYPHS[letter];
    glyph.forEach((line, row) => {
      [...line].forEach((pixel, column) => {
        if (pixel === "1") {
          cells.push({ x: letterIndex * LETTER_ADVANCE + column, y: row });
        }
      });
    });
  });
  return cells;
}

function hash(value: number): number {
  const result = Math.sin(value * 12.9898) * 43758.5453;
  return result - Math.floor(result);
}
