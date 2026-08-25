import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const PATH_SCALE = 72;
const TUBE_RADIUS = 23;

export const torusKnotGeometry: GeometryDefinition = {
  id: "torus-knot",
  label: "三叶结",
  ariaLabel: "由星点组成并持续流动的三叶环面结",
  mark: "torus-knot",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const v = row / rows * TAU + phase * 1.25;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);

      for (let column = 0; column < columns; column += 1) {
        const u = column / columns * TAU + phase * 0.52;
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

        let normalX: number;
        let normalY: number;
        let normalZ: number;
        if (Math.abs(tangentZ) < 0.9) {
          normalX = tangentY;
          normalY = -tangentX;
          normalZ = 0;
        } else {
          normalX = -tangentZ;
          normalY = 0;
          normalZ = tangentX;
        }
        const normalLength = Math.hypot(normalX, normalY, normalZ);
        normalX /= normalLength;
        normalY /= normalLength;
        normalZ /= normalLength;

        const binormalX = tangentY * normalZ - tangentZ * normalY;
        const binormalY = tangentZ * normalX - tangentX * normalZ;
        const binormalZ = tangentX * normalY - tangentY * normalX;
        const tubeX = (normalX * cosV + binormalX * sinV) * TUBE_RADIUS;
        const tubeY = (normalY * cosV + binormalY * sinV) * TUBE_RADIUS;
        const tubeZ = (normalZ * cosV + binormalZ * sinV) * TUBE_RADIUS;
        const positionIndex = index * 3;

        positions[positionIndex] = centerX + tubeX;
        positions[positionIndex + 1] = centerY + tubeY;
        positions[positionIndex + 2] = centerZ + tubeZ;
        pointSizes[index] = 0.46 + Math.abs(cosV + 0.18) * 0.72;
        index += 1;
      }
    }
  }
};
