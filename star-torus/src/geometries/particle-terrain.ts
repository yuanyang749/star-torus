import type { GeometryDefinition } from "@/geometries/types";

const HALF_WIDTH = 225;
const HALF_DEPTH = 165;

export const particleTerrainGeometry: GeometryDefinition = {
  id: "particle-terrain",
  label: "粒子地形",
  ariaLabel: "由多频波场生成并缓慢流动的粒子山脉地形",
  mark: "particle-terrain",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let column = 0; column < columns; column += 1) {
      const columnProgress = columns > 1 ? column / (columns - 1) : 0.5;
      const normalizedX = columnProgress * 2 - 1;
      const x = normalizedX * HALF_WIDTH;

      for (let row = 0; row < rows; row += 1) {
        const rowProgress = rows > 1 ? row / (rows - 1) : 0.5;
        const normalizedZ = rowProgress * 2 - 1;
        const z = normalizedZ * HALF_DEPTH;
        const ridge = Math.sin(normalizedX * 5.6 + phase * 0.55)
          * Math.cos(normalizedZ * 3.8 - phase * 0.38);
        const folds = Math.sin((normalizedX + normalizedZ) * 11.5 - phase * 0.72) * 0.34;
        const detail = Math.cos(normalizedX * 19 - normalizedZ * 13 + phase) * 0.12;
        const valley = -Math.exp(
          -(normalizedX * normalizedX * 2.4 + normalizedZ * normalizedZ * 0.75)
        ) * 0.38;
        const height = (ridge * 0.54 + folds + detail + valley) * 76;
        const positionIndex = index * 3;
        const edgeFade = Math.sin(columnProgress * Math.PI)
          * Math.sin(rowProgress * Math.PI);

        positions[positionIndex] = x;
        positions[positionIndex + 1] = height;
        positions[positionIndex + 2] = z;
        pointSizes[index] = 0.38 + edgeFade * 0.38
          + Math.max(0, height / 120) * 0.22;
        index += 1;
      }
    }
  }
};
