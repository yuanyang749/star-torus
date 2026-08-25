import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;

export const heartSurfaceGeometry: GeometryDefinition = {
  id: "heart",
  label: "心形面",
  ariaLabel: "由星点组成并持续流动的三维心形曲面",
  mark: "heart",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const depth = ((row + 0.5) / rows) * 2 - 1;
      const sectionScale = Math.sqrt(Math.max(0, 1 - depth * depth));

      for (let column = 0; column < columns; column += 1) {
        const u = column / columns * TAU + phase * 0.64;
        const sinU = Math.sin(u);
        const heartX = 16 * sinU * sinU * sinU;
        const heartY = 13 * Math.cos(u)
          - 5 * Math.cos(2 * u)
          - 2 * Math.cos(3 * u)
          - Math.cos(4 * u);
        const positionIndex = index * 3;

        positions[positionIndex] = heartX * 12.7 * sectionScale;
        positions[positionIndex + 1] = -heartY * 12.2 * sectionScale;
        positions[positionIndex + 2] = depth * 116;
        pointSizes[index] = 0.44 + sectionScale * (0.5 + Math.abs(Math.cos(u)) * 0.28);
        index += 1;
      }
    }
  }
};
