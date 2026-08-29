import type { GeometryDefinition } from "@/geometries/types";

const RING_RADIUS = 176;
const HALF_WIDTH = 88;

export const mobiusGeometry: GeometryDefinition = {
  id: "mobius",
  label: "莫比乌斯",
  ariaLabel: "由星点组成并持续流动的莫比乌斯环",
  mark: "mobius",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const stripOffset = (((row + 0.5) / rows) * 2 - 1) * HALF_WIDTH;
      const normalizedStrip = Math.abs(stripOffset) / HALF_WIDTH;

      for (let column = 0; column < columns; column += 1) {
        const u = column / columns * Math.PI * 2 + phase;
        const halfU = u * 0.5;
        const radial = RING_RADIUS + stripOffset * Math.cos(halfU);
        const positionIndex = index * 3;
        positions[positionIndex] = radial * Math.cos(u);
        positions[positionIndex + 1] = radial * Math.sin(u);
        positions[positionIndex + 2] = stripOffset * Math.sin(halfU);
        pointSizes[index] = 0.48
          + (1 - normalizedStrip * 0.35) * (0.52 + Math.abs(Math.cos(halfU)) * 0.2);
        index += 1;
      }
    }
  }
};
