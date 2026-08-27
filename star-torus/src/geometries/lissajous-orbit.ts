import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const TRACK_COUNT = 8;

export const lissajousOrbitGeometry: GeometryDefinition = {
  id: "lissajous-orbit",
  label: "星轨",
  ariaLabel: "由多组闭合利萨如轨道交错形成的三维星轨",
  mark: "lissajous-orbit",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let column = 0; column < columns; column += 1) {
      const progress = column / columns;
      const baseAngle = progress * TAU + phase * 0.18;

      for (let row = 0; row < rows; row += 1) {
        const track = row % TRACK_COUNT;
        const layer = Math.floor(row / TRACK_COUNT);
        const trackPhase = track / TRACK_COUNT * TAU;
        const thicknessAngle = layer / Math.ceil(rows / TRACK_COUNT) * TAU;
        const localRadius = 2.5 + layer * 0.75;
        const angle = baseAngle + trackPhase * 0.075;
        const positionIndex = index * 3;

        positions[positionIndex] = Math.sin(angle * 3 + trackPhase) * 188
          + Math.cos(thicknessAngle) * localRadius;
        positions[positionIndex + 1] = Math.sin(angle * 4 + trackPhase * 0.63) * 142
          + Math.sin(thicknessAngle) * localRadius;
        positions[positionIndex + 2] = Math.sin(angle * 5 + trackPhase * 1.37) * 108
          + Math.cos(thicknessAngle + angle) * localRadius;
        pointSizes[index] = 0.44 + (track % 3) * 0.1
          + Math.sin(progress * TAU * 3 - phase * 2 + trackPhase) * 0.08;
        index += 1;
      }
    }
  }
};
