import type { GeometryDefinition } from "@/components/formfield/geometries/types";

const RADIUS = 218;
const LATITUDE_EXPONENT = 0.5;
const LONGITUDE_EXPONENT = 0.46;
const GOLDEN_RATIO_CONJUGATE = (Math.sqrt(5) - 1) / 2;

interface SuperellipsoidSamples {
  pointCount: number;
  positions: Float32Array;
  pointSizes: Float32Array;
}

let cachedSamples: SuperellipsoidSamples | undefined;

export const superellipsoidGeometry: GeometryDefinition = {
  id: "superellipsoid",
  label: "超椭球",
  ariaLabel: "由星点组成并持续流动的超椭球曲面",
  mark: "superellipsoid",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const samples = getSamples(columns * rows);
    const angle = phase * 0.7;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    for (let index = 0; index < samples.pointCount; index += 1) {
      const positionIndex = index * 3;
      const x = samples.positions[positionIndex];
      const y = samples.positions[positionIndex + 1];

      positions[positionIndex] = x * cosAngle - y * sinAngle;
      positions[positionIndex + 1] = x * sinAngle + y * cosAngle;
      positions[positionIndex + 2] = samples.positions[positionIndex + 2];
    }

    pointSizes.set(samples.pointSizes);
  }
};

function getSamples(pointCount: number): SuperellipsoidSamples {
  if (cachedSamples?.pointCount === pointCount) return cachedSamples;

  const positions = new Float32Array(pointCount * 3);
  const pointSizes = new Float32Array(pointCount);
  const longitudePower = 2 / LONGITUDE_EXPONENT;
  const latitudePower = 2 / LATITUDE_EXPONENT;
  const ringPower = LONGITUDE_EXPONENT / LATITUDE_EXPONENT;

  for (let index = 0; index < pointCount; index += 1) {
    const face = index % 6;
    const faceIndex = Math.floor(index / 6);
    const facePointCount = Math.floor((pointCount - 1 - face) / 6) + 1;
    const u = (faceIndex + 0.5) / facePointCount * 2 - 1;
    const v = fract(
      radicalInverseBase2(faceIndex)
      + 0.5 / facePointCount
      + face * GOLDEN_RATIO_CONJUGATE
    ) * 2 - 1;
    let directionX: number;
    let directionY: number;
    let directionZ: number;

    switch (face) {
      case 0:
        directionX = 1;
        directionY = u;
        directionZ = v;
        break;
      case 1:
        directionX = -1;
        directionY = u;
        directionZ = v;
        break;
      case 2:
        directionX = u;
        directionY = 1;
        directionZ = v;
        break;
      case 3:
        directionX = u;
        directionY = -1;
        directionZ = v;
        break;
      case 4:
        directionX = u;
        directionY = v;
        directionZ = 1;
        break;
      default:
        directionX = u;
        directionY = v;
        directionZ = -1;
        break;
    }

    const radialTerm = Math.pow(
      Math.pow(Math.abs(directionX), longitudePower)
        + Math.pow(Math.abs(directionY), longitudePower),
      ringPower
    );
    const verticalTerm = Math.pow(Math.abs(directionZ), latitudePower);
    const scale = RADIUS * Math.pow(
      radialTerm + verticalTerm,
      -LATITUDE_EXPONENT / 2
    );
    const positionIndex = index * 3;
    const energy = fract((index + 1) * GOLDEN_RATIO_CONJUGATE);

    positions[positionIndex] = directionX * scale;
    positions[positionIndex + 1] = directionY * scale;
    positions[positionIndex + 2] = directionZ * scale;
    pointSizes[index] = 0.58 + energy * 0.42;
  }

  cachedSamples = { pointCount, positions, pointSizes };
  return cachedSamples;
}

function radicalInverseBase2(index: number): number {
  let value = index;
  let inverse = 0;
  let fraction = 0.5;

  while (value > 0) {
    inverse += (value & 1) * fraction;
    value >>>= 1;
    fraction *= 0.5;
  }

  return inverse;
}

function fract(value: number): number {
  return value - Math.floor(value);
}
