import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const ISO_LEVEL = 1;
const SEARCH_RADIUS = 230;
const BISECTION_STEPS = 12;

interface Blob {
  x: number;
  y: number;
  z: number;
  radiusSquared: number;
}

export const metaballGeometry: GeometryDefinition = {
  id: "metaball",
  label: "流体软体",
  ariaLabel: "多个隐式球场融合并呼吸变形的粒子 Metaball",
  mark: "metaball",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const blobs: readonly Blob[] = [
      blob(78 + Math.sin(phase * 0.72) * 10, 20, 45, 56),
      blob(-74, 50 + Math.cos(phase * 0.63) * 9, 12, 54),
      blob(2, -76, -42 + Math.sin(phase * 0.51) * 8, 50),
      blob(-20 + Math.cos(phase * 0.81) * 7, 5, 78, 48)
    ];
    let index = 0;

    for (let column = 0; column < columns; column += 1) {
      const longitude = column / columns * TAU;

      for (let row = 0; row < rows; row += 1) {
        const latitude = ((row + 0.5) / rows - 0.5) * Math.PI;
        const cosLatitude = Math.cos(latitude);
        const directionX = Math.cos(longitude) * cosLatitude;
        const directionY = Math.sin(latitude);
        const directionZ = Math.sin(longitude) * cosLatitude;
        let inner = 0;
        let outer = SEARCH_RADIUS;

        for (let step = 0; step < BISECTION_STEPS; step += 1) {
          const distance = (inner + outer) * 0.5;
          const field = sampleField(
            distance * directionX,
            distance * directionY,
            distance * directionZ,
            blobs
          );
          if (field >= ISO_LEVEL) {
            inner = distance;
          } else {
            outer = distance;
          }
        }

        const radius = (inner + outer) * 0.5;
        const positionIndex = index * 3;
        positions[positionIndex] = directionX * radius;
        positions[positionIndex + 1] = directionY * radius;
        positions[positionIndex + 2] = directionZ * radius;
        pointSizes[index] = 0.48 + Math.min(0.38, Math.abs(radius - 120) / 150)
          + hash(index * 23) * 0.1;
        index += 1;
      }
    }
  }
};

function blob(x: number, y: number, z: number, radius: number): Blob {
  return { x, y, z, radiusSquared: radius * radius };
}

function sampleField(x: number, y: number, z: number, blobs: readonly Blob[]): number {
  let field = 0;
  for (const item of blobs) {
    const deltaX = x - item.x;
    const deltaY = y - item.y;
    const deltaZ = z - item.z;
    field += item.radiusSquared / Math.max(
      1,
      deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ
    );
  }
  return field;
}

function hash(value: number): number {
  const result = Math.sin(value * 12.9898) * 43758.5453;
  return result - Math.floor(result);
}
