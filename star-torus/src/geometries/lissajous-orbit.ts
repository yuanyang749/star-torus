import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const TRACK_COUNT = 4;

export const lissajousOrbitGeometry: GeometryDefinition = {
  id: "lissajous-orbit",
  label: "星轨",
  ariaLabel: "由多组闭合利萨如轨道交错形成的三维星轨",
  mark: "lissajous-orbit",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const pointCount = columns * rows;
    const pointsPerTrack = Math.ceil(pointCount / TRACK_COUNT);

    for (let index = 0; index < pointCount; index += 1) {
      const track = Math.min(TRACK_COUNT - 1, Math.floor(index / pointsPerTrack));
      const trackIndex = index - track * pointsPerTrack;
      const progress = trackIndex / pointsPerTrack;
      const angle = progress * TAU + phase * 0.16;
      const trackPhase = track / TRACK_COUNT * TAU;
      const positionIndex = index * 3;

      positions[positionIndex] = Math.sin(angle * 3 + trackPhase) * 186;
      positions[positionIndex + 1] = Math.sin(angle * 4 + trackPhase * 0.55) * 138;
      positions[positionIndex + 2] = Math.sin(angle * 5 + trackPhase * 1.15) * 106;
      pointSizes[index] = 0.48 + track * 0.07
        + Math.sin(progress * TAU * 3 - phase * 2 + trackPhase) * 0.06;
    }
  }
};
