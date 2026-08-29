import type { GeometryDefinition } from "@/geometries/types";

const STEP = Math.PI / 40;
const RADIUS = 90;

export const torusGeometry: GeometryDefinition = {
  id: "torus",
  label: "星环",
  ariaLabel: "由星点组成并持续流动的三维星环",
  mark: "torus",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const v = row * STEP * 2 + phase * 2;
      const sinV = Math.sin(v);
      const cosV = Math.cos(v);
      const ringRadius = (2 + sinV) * RADIUS;

      for (let column = 0; column < columns; column += 1) {
        const u = column * STEP + phase;
        const positionIndex = index * 3;
        positions[positionIndex] = ringRadius * Math.cos(u);
        positions[positionIndex + 1] = ringRadius * Math.sin(u);
        positions[positionIndex + 2] = cosV * RADIUS;
        pointSizes[index] = Math.abs(cosV + 0.3);
        index += 1;
      }
    }
  }
};
