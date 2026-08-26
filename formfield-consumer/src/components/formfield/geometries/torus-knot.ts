import type { GeometryDefinition } from "@/components/formfield/geometries/types";

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const PATH_SCALE = 72;
const BUNDLE_RADIUS = 11.5;

export const torusKnotGeometry: GeometryDefinition = {
  id: "torus-knot",
  label: "三叶结",
  ariaLabel: "由星点组成并持续流动的三叶环面结",
  mark: "torus-knot",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const pointCount = columns * rows;
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const sampleOrder = column * rows + row;
        const progress = (sampleOrder + 0.5) / pointCount;
        const pathAngle = progress * TAU;
        const u = pathAngle + phase * 0.44;
        const sin2U = Math.sin(2 * u);
        const cos2U = Math.cos(2 * u);
        const sin3U = Math.sin(3 * u);
        const cos3U = Math.cos(3 * u);
        const radial = 2 + cos3U;
        const centerX = radial * cos2U * PATH_SCALE;
        const centerY = radial * sin2U * PATH_SCALE;
        const centerZ = sin3U * PATH_SCALE;

        let tangentX = -3 * sin3U * cos2U - 2 * radial * sin2U;
        let tangentY = -3 * sin3U * sin2U + 2 * radial * cos2U;
        let tangentZ = 3 * cos3U;
        const tangentLength = Math.hypot(tangentX, tangentY, tangentZ);
        tangentX /= tangentLength;
        tangentY /= tangentLength;
        tangentZ /= tangentLength;

        const normalX = cos3U * cos2U;
        const normalY = cos3U * sin2U;
        const normalZ = sin3U;
        const binormalX = tangentY * normalZ - tangentZ * normalY;
        const binormalY = tangentZ * normalX - tangentX * normalZ;
        const binormalZ = tangentX * normalY - tangentY * normalX;
        const radialSeed = fract(
          (row + 1) * 0.754877666
          + (column + 1) * 0.569840296
        );
        const dustRadius = 0.7 + radialSeed * radialSeed * BUNDLE_RADIUS;
        const dustAngle = row * GOLDEN_ANGLE + column * 0.43 + phase * 1.05;
        const cosDust = Math.cos(dustAngle);
        const sinDust = Math.sin(dustAngle);
        const offsetX = (normalX * cosDust + binormalX * sinDust) * dustRadius;
        const offsetY = (normalY * cosDust + binormalY * sinDust) * dustRadius;
        const offsetZ = (normalZ * cosDust + binormalZ * sinDust) * dustRadius;
        const energy = 0.5 + Math.sin(pathAngle * 6 - phase * 5.8) * 0.5;
        const coreWeight = 1 - (dustRadius - 0.7) / BUNDLE_RADIUS;
        const positionIndex = index * 3;

        positions[positionIndex] = centerX + offsetX;
        positions[positionIndex + 1] = centerY + offsetY;
        positions[positionIndex + 2] = centerZ + offsetZ;
        pointSizes[index] = 0.42 + coreWeight * 0.32 + energy * 0.28;
        index += 1;
      }
    }
  }
};

function fract(value: number): number {
  return value - Math.floor(value);
}
