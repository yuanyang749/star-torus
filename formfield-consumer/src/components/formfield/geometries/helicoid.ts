import type { GeometryDefinition } from "@/components/formfield/geometries/types";

const GOLDEN_RATIO_CONJUGATE = (Math.sqrt(5) - 1) / 2;
const HALF_WIDTH = 210;
const HALF_TURNS = Math.PI * 1.9;
const PITCH = 26;

export const helicoidGeometry: GeometryDefinition = {
  id: "helicoid",
  label: "螺旋面",
  ariaLabel: "由星点组成并持续旋转的螺旋曲面",
  mark: "helicoid",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const radialJitter = fract(
          (column + 1) * GOLDEN_RATIO_CONJUGATE + (row + 1) * 0.438289
        );
        const radialUnit = ((row + radialJitter) / rows) * 2 - 1;
        const radial = Math.sign(radialUnit)
          * Math.pow(Math.abs(radialUnit), 0.72)
          * HALF_WIDTH;
        const normalizedRadius = Math.abs(radial) / HALF_WIDTH;
        const angularJitter = fract(
          (row + 1) * 0.754877666 + (column + 1) * 0.569840296
        );
        const angularProgress = (column + angularJitter) / columns;
        const baseAngle = (angularProgress * 2 - 1) * HALF_TURNS;
        const angle = baseAngle + phase * 0.82;
        const energy = 0.5 + Math.sin(
          baseAngle * 1.7 - radialUnit * Math.PI * 1.2 - phase * 3.8
        ) * 0.5;
        const positionIndex = index * 3;

        positions[positionIndex] = radial * Math.cos(angle);
        positions[positionIndex + 1] = radial * Math.sin(angle);
        positions[positionIndex + 2] = baseAngle * PITCH;
        pointSizes[index] = 0.44 + normalizedRadius * 0.4 + energy * 0.25;
        index += 1;
      }
    }
  }
};

function fract(value: number): number {
  return value - Math.floor(value);
}
