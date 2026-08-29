import type { GeometryDefinition } from "@/geometries/types";

const RADIUS = 225;

export const sphereGeometry: GeometryDefinition = {
  id: "sphere",
  label: "球体",
  ariaLabel: "由星点组成并持续流动的三维球体",
  mark: "sphere",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const latitude = ((row + 0.5) / rows - 0.5) * Math.PI;
      const sinLatitude = Math.sin(latitude);
      const cosLatitude = Math.cos(latitude);
      const radial = RADIUS * cosLatitude;

      for (let column = 0; column < columns; column += 1) {
        const longitude = column / columns * Math.PI * 2 + phase;
        const positionIndex = index * 3;
        positions[positionIndex] = radial * Math.cos(longitude);
        positions[positionIndex + 1] = radial * Math.sin(longitude);
        positions[positionIndex + 2] = RADIUS * sinLatitude;
        pointSizes[index] = 0.36 + Math.abs(cosLatitude) * 0.94;
        index += 1;
      }
    }
  }
};
