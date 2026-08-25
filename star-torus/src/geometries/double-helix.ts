import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const HALF_TURNS = Math.PI * 3;
const HELIX_RADIUS = 102;
const HALF_HEIGHT = 218;
const TUBE_RADIUS = 11;

export const doubleHelixGeometry: GeometryDefinition = {
  id: "double-helix",
  label: "双螺旋",
  ariaLabel: "由两条相互缠绕的星点螺旋链组成的曲面",
  mark: "double-helix",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const strandRows = Math.floor(rows / 2);
    const verticalPitch = HALF_HEIGHT / HALF_TURNS;
    const binormalLength = Math.hypot(verticalPitch, HELIX_RADIUS);
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const strand = row < strandRows ? 0 : 1;
      const tubeRow = row % strandRows;
      const v = tubeRow / strandRows * TAU + phase * 1.35;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);

      for (let column = 0; column < columns; column += 1) {
        const baseAngle = (column / (columns - 1) * 2 - 1) * HALF_TURNS;
        const angle = baseAngle + strand * Math.PI + phase * 0.62;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const normalX = cosAngle;
        const normalY = sinAngle;
        const binormalX = -verticalPitch * sinAngle / binormalLength;
        const binormalY = verticalPitch * cosAngle / binormalLength;
        const binormalZ = -HELIX_RADIUS / binormalLength;
        const positionIndex = index * 3;

        positions[positionIndex] = HELIX_RADIUS * cosAngle
          + (normalX * cosV + binormalX * sinV) * TUBE_RADIUS;
        positions[positionIndex + 1] = HELIX_RADIUS * sinAngle
          + (normalY * cosV + binormalY * sinV) * TUBE_RADIUS;
        positions[positionIndex + 2] = baseAngle / HALF_TURNS * HALF_HEIGHT
          + binormalZ * sinV * TUBE_RADIUS;
        pointSizes[index] = 0.48 + Math.abs(cosV + 0.16) * 0.7;
        index += 1;
      }
    }
  }
};
