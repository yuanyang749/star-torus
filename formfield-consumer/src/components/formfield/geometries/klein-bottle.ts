import type { GeometryDefinition } from "@/components/formfield/geometries/types";

const TAU = Math.PI * 2;
const BODY_SWEEP = 2.65;
const PROFILE_TAPER = 0.28;
const SCALE_X = 32;
const SCALE_HEIGHT = 25;
const SCALE_DEPTH = 26;
const CENTER_X = -0.8;
const CENTER_HEIGHT = -0.84;
const PRE_ROTATION_Y = 1.12;
const COS_PRE_ROTATION = Math.cos(PRE_ROTATION_Y);
const SIN_PRE_ROTATION = Math.sin(PRE_ROTATION_Y);

export const kleinBottleGeometry: GeometryDefinition = {
  id: "klein",
  label: "克莱因瓶",
  ariaLabel: "由星点组成并持续流动的克莱因瓶曲面",
  mark: "klein",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const uJitter = fract(
          (row + 1) * 0.754877666 + (column + 1) * 0.569840296
        );
        const vJitter = fract(
          (column + 1) * 0.618033989 + (row + 1) * 0.438289
        );
        const u = (column + uJitter) / columns * TAU;
        const v = (row + vJitter) / rows * TAU + phase * 0.92;
        const sinU = Math.sin(u);
        const cosU = Math.cos(u);
        const sinV = Math.sin(v);
        const cosV = Math.cos(v);
        const crossSection = 2 * (1 - cosU / 2) * (1 - PROFILE_TAPER * sinU);
        const bodyCenter = BODY_SWEEP * cosU * (1 + sinU);
        let x: number;
        let height: number;

        if (u < Math.PI) {
          x = bodyCenter + crossSection * cosU * cosV;
          height = -8 * sinU - crossSection * sinU * cosV;
        } else {
          x = bodyCenter - crossSection * cosV;
          height = -8 * sinU;
        }

        const depth = -crossSection * sinV;
        const energy = 0.5 + Math.sin(u * 3 - phase * 4.6 + v * 0.4) * 0.5;
        const sourceX = (x - CENTER_X) * SCALE_X;
        const sourceY = -(height - CENTER_HEIGHT) * SCALE_HEIGHT;
        const sourceZ = depth * SCALE_DEPTH;
        const positionIndex = index * 3;

        positions[positionIndex] = sourceX * COS_PRE_ROTATION
          + sourceZ * SIN_PRE_ROTATION;
        positions[positionIndex + 1] = sourceY;
        positions[positionIndex + 2] = -sourceX * SIN_PRE_ROTATION
          + sourceZ * COS_PRE_ROTATION;
        pointSizes[index] = 0.4 + Math.abs(cosV + 0.18) * 0.38 + energy * 0.22;
        index += 1;
      }
    }
  }
};

function fract(value: number): number {
  return value - Math.floor(value);
}
