import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const HALF_DEPTH = 245;
const BASE_RADIUS = 108;

export const lightTunnelGeometry: GeometryDefinition = {
  id: "light-tunnel",
  label: "光隧道",
  ariaLabel: "由连续粒子光环构成的纵深穿梭隧道",
  mark: "light-tunnel",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let column = 0; column < columns; column += 1) {
      const travel = fract(column / columns + phase * 0.035);
      const z = (travel * 2 - 1) * HALF_DEPTH;
      const perspective = 0.72 + travel * 0.36;
      const ringWave = Math.sin(column * 0.73 - phase * 2.4) * 12;
      const radius = (BASE_RADIUS + ringWave) * perspective;
      const rotation = column * 0.19 + phase * 0.42;

      for (let row = 0; row < rows; row += 1) {
        const angle = row / rows * TAU + rotation;
        const positionIndex = index * 3;
        const ripple = Math.sin(angle * 5 - phase * 1.8 + column * 0.27) * 4.5;

        positions[positionIndex] = Math.cos(angle) * (radius + ripple);
        positions[positionIndex + 1] = Math.sin(angle) * (radius + ripple);
        positions[positionIndex + 2] = z;
        pointSizes[index] = 0.38 + travel * 0.52
          + (row % 8 === 0 ? 0.24 : 0);
        index += 1;
      }
    }
  }
};

function fract(value: number): number {
  return value - Math.floor(value);
}
