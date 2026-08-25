import type { GeometryDefinition } from "@/geometries/types";

const HALF_WIDTH = 210;
const HALF_TURNS = Math.PI * 2.7;
const PITCH = 17;

export const helicoidGeometry: GeometryDefinition = {
  id: "helicoid",
  label: "螺旋面",
  ariaLabel: "由星点组成并持续旋转的螺旋曲面",
  mark: "helicoid",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const radial = (((row + 0.5) / rows) * 2 - 1) * HALF_WIDTH;
      const normalizedRadius = Math.abs(radial) / HALF_WIDTH;

      for (let column = 0; column < columns; column += 1) {
        const baseAngle = (column / (columns - 1) * 2 - 1) * HALF_TURNS;
        const angle = baseAngle + phase * 0.82;
        const positionIndex = index * 3;

        positions[positionIndex] = radial * Math.cos(angle);
        positions[positionIndex + 1] = radial * Math.sin(angle);
        positions[positionIndex + 2] = baseAngle * PITCH;
        pointSizes[index] = 0.4 + (1 - normalizedRadius * 0.28) * 0.76;
        index += 1;
      }
    }
  }
};
