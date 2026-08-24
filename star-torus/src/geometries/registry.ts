import type { ShapeId } from "@/domain/star-field";
import { mobiusGeometry } from "@/geometries/mobius";
import { sphereGeometry } from "@/geometries/sphere";
import { torusGeometry } from "@/geometries/torus";
import type { GeometryDefinition } from "@/geometries/types";

export const GEOMETRY_DEFINITIONS: readonly GeometryDefinition[] = [
  torusGeometry,
  sphereGeometry,
  mobiusGeometry
];

const geometryById = new Map<ShapeId, GeometryDefinition>(
  GEOMETRY_DEFINITIONS.map((definition) => [definition.id, definition])
);

export function getGeometryDefinition(id: ShapeId): GeometryDefinition {
  return geometryById.get(id) ?? torusGeometry;
}
