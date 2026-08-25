import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const ARM_COUNT = 4;
const MAX_RADIUS = 226;

export const galaxyVortexGeometry: GeometryDefinition = {
  id: "galaxy",
  label: "星系漩涡",
  ariaLabel: "由四条星点旋臂组成并持续旋转的星系漩涡",
  mark: "galaxy",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const lanesPerArm = Math.floor(columns / ARM_COUNT);
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const arm = column % ARM_COUNT;
        const lane = Math.floor(column / ARM_COUNT);
        const laneProgress = lanesPerArm > 1 ? lane / (lanesPerArm - 1) : 0.5;
        const laneOffset = laneProgress - 0.5;
        const radialProgress = (row + (lane + 0.5) / lanesPerArm) / rows;
        const radius = 15 + radialProgress * (MAX_RADIUS - 15);
        const angle = arm / ARM_COUNT * TAU
          + radius * 0.0205
          + laneOffset * 0.68
          + phase * 0.82;
        const centerLift = 1 - radialProgress;
        const z = laneOffset * 25 * centerLift
          + Math.sin(radius * 0.052 + lane * 1.67 + phase) * 8 * centerLift;
        const positionIndex = index * 3;

        positions[positionIndex] = radius * Math.cos(angle);
        positions[positionIndex + 1] = radius * Math.sin(angle);
        positions[positionIndex + 2] = z;
        pointSizes[index] = 0.38
          + Math.pow(centerLift, 1.45) * 1.18
          + Math.abs(laneOffset) * 0.16;
        index += 1;
      }
    }
  }
};
