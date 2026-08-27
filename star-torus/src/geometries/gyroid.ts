import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const SCALE = 56;

export const gyroidGeometry: GeometryDefinition = {
  id: "gyroid",
  label: "极小曲面",
  ariaLabel: "满足三周期极小曲面方程的粒子 Gyroid",
  mark: "gyroid",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const branchRows = Math.max(1, Math.floor(rows / 2));
    let index = 0;

    for (let column = 0; column < columns; column += 1) {
      const x = column / columns * TAU - Math.PI + phase * 0.07;

      for (let row = 0; row < rows; row += 1) {
        const branch = row < branchRows ? 1 : -1;
        const branchRow = row % branchRows;
        const y = branchRow / branchRows * TAU - Math.PI - phase * 0.05;
        const coefficientCos = Math.sin(y);
        const coefficientSin = Math.cos(x);
        const constant = Math.sin(x) * Math.cos(y);
        const amplitude = Math.hypot(coefficientCos, coefficientSin);
        const target = amplitude > 0.0001
          ? clamp(-constant / amplitude, -1, 1)
          : 0;
        const offset = Math.atan2(coefficientSin, coefficientCos);
        const z = wrapAngle(offset + branch * Math.acos(target));
        const positionIndex = index * 3;
        const surfaceEnergy = Math.abs(
          Math.sin(x) * Math.cos(y)
          + Math.sin(y) * Math.cos(z)
          + Math.sin(z) * Math.cos(x)
        );

        positions[positionIndex] = x * SCALE;
        positions[positionIndex + 1] = y * SCALE;
        positions[positionIndex + 2] = z * SCALE;
        pointSizes[index] = 0.46 + (1 - Math.min(1, surfaceEnergy * 8)) * 0.36;
        index += 1;
      }
    }
  }
};

function wrapAngle(value: number): number {
  return ((value + Math.PI) % TAU + TAU) % TAU - Math.PI;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
