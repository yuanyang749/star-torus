import type { ShapeId } from "@/domain/star-field";

export const GRID_COLUMNS = 80;
export const GRID_ROWS = 40;
export const POINT_COUNT = GRID_COLUMNS * GRID_ROWS;

export interface GeometrySampleContext {
  phase: number;
  columns: number;
  rows: number;
}

export interface GeometryDefinition {
  id: ShapeId;
  label: string;
  ariaLabel: string;
  mark: string;
  sample(
    positions: Float32Array,
    pointSizes: Float32Array,
    context: GeometrySampleContext
  ): void;
}
