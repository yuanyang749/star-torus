import type { GeometryDefinition } from "@/components/formfield/geometries/types";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const HALF_TURNS = Math.PI * 4;
const HELIX_RADIUS = 80;
const HALF_HEIGHT = 205;
const BUNDLE_RADIUS = 5.4;

export const doubleHelixGeometry: GeometryDefinition = {
  id: "double-helix",
  label: "双螺旋",
  ariaLabel: "由两束相互缠绕的星点链组成的双螺旋",
  mark: "double-helix",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const strandRows = Math.floor(rows / 2);
    const samplesPerStrand = columns * strandRows;
    const verticalPitch = HALF_HEIGHT / HALF_TURNS;
    const binormalLength = Math.hypot(verticalPitch, HELIX_RADIUS);
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const strand = row < strandRows ? 0 : 1;
      const lane = row % strandRows;

      for (let column = 0; column < columns; column += 1) {
        const sampleOrder = column * strandRows + lane;
        const progress = (sampleOrder + 0.5) / samplesPerStrand;
        const baseAngle = (progress * 2 - 1) * HALF_TURNS;
        const angle = baseAngle + strand * Math.PI + phase * 0.48;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const normalX = cosAngle;
        const normalY = sinAngle;
        const binormalX = -verticalPitch * sinAngle / binormalLength;
        const binormalY = verticalPitch * cosAngle / binormalLength;
        const binormalZ = -HELIX_RADIUS / binormalLength;
        const radialSeed = fract(
          (lane + 1) * 0.754877666
          + (column + 1) * 0.569840296
          + strand * 0.438289
        );
        const dustRadius = 0.55 + Math.pow(radialSeed, 1.7) * BUNDLE_RADIUS;
        const dustAngle = lane * GOLDEN_ANGLE
          + column * 0.47
          + strand * Math.PI * 0.25
          + phase * 1.1;
        const cosDust = Math.cos(dustAngle);
        const sinDust = Math.sin(dustAngle);
        const energy = 0.5 + Math.sin(
          baseAngle * 2.15 - phase * 5.2 + strand * Math.PI
        ) * 0.5;
        const coreWeight = 1 - (dustRadius - 0.55) / BUNDLE_RADIUS;
        const positionIndex = index * 3;

        positions[positionIndex] = HELIX_RADIUS * cosAngle
          + (normalX * cosDust + binormalX * sinDust) * dustRadius;
        positions[positionIndex + 1] = HELIX_RADIUS * sinAngle
          + (normalY * cosDust + binormalY * sinDust) * dustRadius;
        positions[positionIndex + 2] = (progress * 2 - 1) * HALF_HEIGHT
          + binormalZ * sinDust * dustRadius;
        pointSizes[index] = 0.43 + coreWeight * 0.34 + energy * 0.27;
        index += 1;
      }
    }
  }
};

function fract(value: number): number {
  return value - Math.floor(value);
}
