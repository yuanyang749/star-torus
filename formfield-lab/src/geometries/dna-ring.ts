import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const RING_RADIUS = 150;
const HELIX_RADIUS = 29;
const STRAND_POINTS = 16;
const HELIX_TURNS = 9;

export const dnaRingGeometry: GeometryDefinition = {
  id: "dna-ring",
  label: "DNA 环链",
  ariaLabel: "首尾相连并带有梯级连接的环形 DNA 双螺旋",
  mark: "dna-ring",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let column = 0; column < columns; column += 1) {
      const progress = column / columns;
      const ringAngle = progress * TAU;
      const helixAngle = progress * TAU * HELIX_TURNS - phase * 1.1;
      const cosRing = Math.cos(ringAngle);
      const sinRing = Math.sin(ringAngle);
      const strandOffset = Math.cos(helixAngle) * HELIX_RADIUS;
      const strandHeight = Math.sin(helixAngle) * HELIX_RADIUS;

      for (let row = 0; row < rows; row += 1) {
        const positionIndex = index * 3;
        let radialOffset: number;
        let y: number;

        if (row < STRAND_POINTS * 2) {
          const strand = row < STRAND_POINTS ? 1 : -1;
          const tubeIndex = row % STRAND_POINTS;
          const tubeAngle = tubeIndex / STRAND_POINTS * TAU;
          const tubeRadius = 3.2;
          radialOffset = strand * strandOffset + Math.cos(tubeAngle) * tubeRadius;
          y = strand * strandHeight + Math.sin(tubeAngle) * tubeRadius;
          pointSizes[index] = 0.58 + (tubeIndex % 4 === 0 ? 0.18 : 0);
        } else {
          const rungCount = Math.max(1, rows - STRAND_POINTS * 2);
          const rungProgress = rungCount > 1
            ? (row - STRAND_POINTS * 2) / (rungCount - 1)
            : 0.5;
          const interpolation = rungProgress * 2 - 1;
          radialOffset = strandOffset * interpolation;
          y = strandHeight * interpolation;
          pointSizes[index] = 0.42 + Math.sin(rungProgress * Math.PI) * 0.24;
        }

        const ringRadius = RING_RADIUS + radialOffset;
        positions[positionIndex] = cosRing * ringRadius;
        positions[positionIndex + 1] = y;
        positions[positionIndex + 2] = sinRing * ringRadius;
        index += 1;
      }
    }
  }
};
