import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const HALF_LENGTH = 230;
const MAX_HALF_WIDTH = 48;
const GOLDEN_RATIO_CONJUGATE = (Math.sqrt(5) - 1) / 2;

export const flowRibbonGeometry: GeometryDefinition = {
  id: "flow-ribbon",
  label: "流光丝带",
  ariaLabel: "由星点编织并持续流动的三维流光丝带",
  mark: "flow-ribbon",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let column = 0; column < columns; column += 1) {
      const progress = columns > 1 ? column / (columns - 1) : 0.5;
      const pathProgress = progress * 2 - 1;
      const primaryWave = pathProgress * Math.PI * 1.15 + phase * 0.9;
      const secondaryWave = pathProgress * Math.PI * 3.4 - phase * 1.25;
      const depthWave = pathProgress * Math.PI * 1.45 - phase * 0.72;
      const twist = pathProgress * Math.PI * 1.3 + phase * 1.05;
      const widthEnvelope = 0.38
        + Math.pow(Math.sin(progress * Math.PI), 0.55) * 0.62;
      const halfWidth = MAX_HALF_WIDTH * widthEnvelope;
      const centerX = pathProgress * HALF_LENGTH;
      const centerY = Math.sin(primaryWave) * 18 + Math.sin(secondaryWave) * 6;
      const centerZ = Math.cos(depthWave) * 28;
      const cosTwist = Math.cos(twist);
      const sinTwist = Math.sin(twist);
      const energy = 0.5
        + Math.sin(pathProgress * TAU * 2.5 - phase * 3.6) * 0.5;
      const rowOffset = fract((column + 1) * GOLDEN_RATIO_CONJUGATE);

      for (let row = 0; row < rows; row += 1) {
        const widthProgress = ((row + rowOffset) / rows) * 2 - 1;
        const positionIndex = index * 3;
        const longitudinalJitter = (
          fract((row + 1) * GOLDEN_RATIO_CONJUGATE + column * 0.754877666) - 0.5
        ) * HALF_LENGTH / columns;

        positions[positionIndex] = centerX + longitudinalJitter;
        positions[positionIndex + 1] = centerY
          + widthProgress * halfWidth * cosTwist;
        positions[positionIndex + 2] = centerZ
          + widthProgress * halfWidth * sinTwist;
        pointSizes[index] = 0.42
          + (1 - Math.abs(widthProgress)) * 0.34
          + energy * 0.28;
        index += 1;
      }
    }
  }
};

function fract(value: number): number {
  return value - Math.floor(value);
}
