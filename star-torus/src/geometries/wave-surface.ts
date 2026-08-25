import type { GeometryDefinition } from "@/geometries/types";

const HALF_SIZE = 210;

export const waveSurfaceGeometry: GeometryDefinition = {
  id: "wave-surface",
  label: "波浪面",
  ariaLabel: "由星点展开形成并持续起伏的波浪马鞍曲面",
  mark: "wave-surface",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const y = (row / (rows - 1) * 2 - 1) * HALF_SIZE;

      for (let column = 0; column < columns; column += 1) {
        const x = (column / (columns - 1) * 2 - 1) * HALF_SIZE;
        const wave = Math.sin(x * 0.024 + phase * 1.45)
          * Math.cos(y * 0.021 - phase * 0.86) * 62;
        const saddle = (x * x - y * y) * 0.00064;
        const z = wave + saddle;
        const positionIndex = index * 3;

        positions[positionIndex] = x;
        positions[positionIndex + 1] = y;
        positions[positionIndex + 2] = z;
        pointSizes[index] = 0.42 + Math.min(1, Math.abs(z) / 88) * 0.72;
        index += 1;
      }
    }
  }
};
