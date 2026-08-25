import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const RADIUS = 218;
const LATITUDE_EXPONENT = 0.5;
const LONGITUDE_EXPONENT = 0.46;

export const superellipsoidGeometry: GeometryDefinition = {
  id: "superellipsoid",
  label: "超椭球",
  ariaLabel: "由星点组成并持续流动的超椭球曲面",
  mark: "superellipsoid",
  sample(positions, pointSizes, { phase, columns, rows }) {
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      const latitude = ((row + 0.5) / rows - 0.5) * Math.PI;
      const signedCosLatitude = signedPower(Math.cos(latitude), LATITUDE_EXPONENT);
      const signedSinLatitude = signedPower(Math.sin(latitude), LATITUDE_EXPONENT);

      for (let column = 0; column < columns; column += 1) {
        const longitude = column / columns * TAU + phase * 0.7;
        const positionIndex = index * 3;

        positions[positionIndex] = RADIUS
          * signedCosLatitude
          * signedPower(Math.cos(longitude), LONGITUDE_EXPONENT);
        positions[positionIndex + 1] = RADIUS
          * signedCosLatitude
          * signedPower(Math.sin(longitude), LONGITUDE_EXPONENT);
        positions[positionIndex + 2] = RADIUS * signedSinLatitude;
        pointSizes[index] = 0.48 + Math.abs(Math.cos(latitude)) * 0.76;
        index += 1;
      }
    }
  }
};

function signedPower(value: number, exponent: number): number {
  return Math.sign(value) * Math.pow(Math.abs(value), exponent);
}
