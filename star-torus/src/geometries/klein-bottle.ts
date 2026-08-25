import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const SCALE = 66;

export const kleinBottleGeometry: GeometryDefinition = {
  id: "klein",
  label: "克莱因瓶",
  ariaLabel: "由星点组成并持续流动的克莱因瓶曲面",
  mark: "klein",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const v = row / rows * TAU + phase * 1.1;
      const sinV = Math.sin(v);
      const sin2V = Math.sin(2 * v);
      const cosV = Math.cos(v);

      for (let column = 0; column < columns; column += 1) {
        const u = column / columns * TAU + phase * 0.42;
        const halfU = u * 0.5;
        const sinHalfU = Math.sin(halfU);
        const cosHalfU = Math.cos(halfU);
        const radial = 2.1 + cosHalfU * sinV - sinHalfU * sin2V;
        const positionIndex = index * 3;

        positions[positionIndex] = radial * Math.cos(u) * SCALE;
        positions[positionIndex + 1] = radial * Math.sin(u) * SCALE;
        positions[positionIndex + 2] = (
          sinHalfU * sinV + cosHalfU * sin2V
        ) * SCALE;
        pointSizes[index] = 0.42 + Math.abs(cosV + 0.24) * 0.72;
        index += 1;
      }
    }
  }
};
