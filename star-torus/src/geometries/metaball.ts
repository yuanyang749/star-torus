import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const BASE_RADIUS = 105;

interface Direction {
  x: number;
  y: number;
  z: number;
  strength: number;
  sharpness: number;
}

export const metaballGeometry: GeometryDefinition = {
  id: "metaball",
  label: "流体软体",
  ariaLabel: "多个柔性体融合并呼吸变形的粒子 Metaball",
  mark: "metaball",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const lobes: Direction[] = [
      direction(0.7 + Math.sin(phase * 0.7) * 0.18, 0.3, 1.0, 62, 3.7),
      direction(-0.82, 0.42 + Math.cos(phase * 0.6) * 0.16, 0.2, 54, 4.2),
      direction(0.05, -0.9, -0.45 + Math.sin(phase * 0.5) * 0.15, 48, 4.5),
      direction(-0.2 + Math.cos(phase * 0.8) * 0.2, 0.05, 1.0, 43, 5.1)
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
        let radius = BASE_RADIUS;

        for (const lobe of lobes) {
          const alignment = directionX * lobe.x + directionY * lobe.y + directionZ * lobe.z;
          radius += lobe.strength * Math.exp((alignment - 1) * lobe.sharpness);
        }

        radius += Math.sin(longitude * 3 + latitude * 4 - phase * 1.6) * 3.2;
        const positionIndex = index * 3;
        positions[positionIndex] = directionX * radius;
        positions[positionIndex + 1] = directionY * radius;
        positions[positionIndex + 2] = directionZ * radius;
        pointSizes[index] = 0.46 + (radius - BASE_RADIUS) / 100 * 0.46
          + hash(index * 23) * 0.12;
        index += 1;
      }
    }
  }
};

function direction(
  x: number,
  y: number,
  z: number,
  strength: number,
  sharpness: number
): Direction {
  const length = Math.hypot(x, y, z) || 1;
  return {
    x: x / length,
    y: y / length,
    z: z / length,
    strength,
    sharpness
  };
}

function hash(value: number): number {
  const result = Math.sin(value * 12.9898) * 43758.5453;
  return result - Math.floor(result);
}
