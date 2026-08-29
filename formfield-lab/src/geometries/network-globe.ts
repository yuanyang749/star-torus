import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const RADIUS = 164;
const SURFACE_RATIO = 0.7;

export const networkGlobeGeometry: GeometryDefinition = {
  id: "network-globe",
  label: "网络地球",
  ariaLabel: "由节点和跃迁弧线构成的三维网络地球",
  mark: "network-globe",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const surfaceRows = Math.max(2, Math.floor(rows * SURFACE_RATIO));
    let index = 0;

    for (let column = 0; column < columns; column += 1) {
      const longitude = column / columns * TAU + phase * 0.08;

      for (let row = 0; row < rows; row += 1) {
        const positionIndex = index * 3;

        if (row < surfaceRows) {
          const latitudeProgress = (row + 0.5) / surfaceRows;
          const latitude = (latitudeProgress - 0.5) * Math.PI;
          const stagger = (row % 2) * TAU / columns * 0.5;
          const pulse = 1 + Math.sin(longitude * 3 + latitude * 5 - phase * 2) * 0.008;
          const radius = RADIUS * pulse;
          const cosLatitude = Math.cos(latitude);

          positions[positionIndex] = Math.cos(longitude + stagger) * cosLatitude * radius;
          positions[positionIndex + 1] = Math.sin(latitude) * radius;
          positions[positionIndex + 2] = Math.sin(longitude + stagger) * cosLatitude * radius;
          pointSizes[index] = 0.45 + Math.pow(cosLatitude, 2) * 0.25
            + (hash(column * 97 + row * 43) > 0.88 ? 0.42 : 0);
        } else {
          const arcSteps = rows - surfaceRows;
          const progress = arcSteps > 1 ? (row - surfaceRows) / (arcSteps - 1) : 0.5;
          const start = globePoint(
            hash(column * 31 + 5) * TAU,
            (hash(column * 47 + 13) - 0.5) * Math.PI * 0.82
          );
          const end = globePoint(
            hash(column * 61 + 29) * TAU,
            (hash(column * 73 + 41) - 0.5) * Math.PI * 0.82
          );
          const point = slerp(start, end, progress);
          const arcLift = 1 + Math.sin(progress * Math.PI) * (0.12 + hash(column * 89) * 0.13);
          const radius = RADIUS * arcLift;

          positions[positionIndex] = point[0] * radius;
          positions[positionIndex + 1] = point[1] * radius;
          positions[positionIndex + 2] = point[2] * radius;
          pointSizes[index] = 0.56 + Math.sin(progress * Math.PI) * 0.34;
        }

        index += 1;
      }
    }
  }
};

type Point3 = readonly [number, number, number];

function globePoint(longitude: number, latitude: number): Point3 {
  const cosLatitude = Math.cos(latitude);
  return [
    Math.cos(longitude) * cosLatitude,
    Math.sin(latitude),
    Math.sin(longitude) * cosLatitude
  ];
}

function slerp(start: Point3, end: Point3, progress: number): Point3 {
  const dot = clamp(start[0] * end[0] + start[1] * end[1] + start[2] * end[2], -0.999, 0.999);
  const angle = Math.acos(dot);
  const sinAngle = Math.sin(angle);
  const startWeight = Math.sin((1 - progress) * angle) / sinAngle;
  const endWeight = Math.sin(progress * angle) / sinAngle;
  return [
    start[0] * startWeight + end[0] * endWeight,
    start[1] * startWeight + end[1] * endWeight,
    start[2] * startWeight + end[2] * endWeight
  ];
}

function hash(value: number): number {
  return fract(Math.sin(value * 12.9898) * 43758.5453);
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
