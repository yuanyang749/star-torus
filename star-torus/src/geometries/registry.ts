import type { ShapeId } from "@/domain/star-field";
import { doubleHelixGeometry } from "@/geometries/double-helix";
import { flowRibbonGeometry } from "@/geometries/flow-ribbon";
import { galaxyVortexGeometry } from "@/geometries/galaxy-vortex";
import { heartSurfaceGeometry } from "@/geometries/heart-surface";
import { helicoidGeometry } from "@/geometries/helicoid";
import { kleinBottleGeometry } from "@/geometries/klein-bottle";
import { mobiusGeometry } from "@/geometries/mobius";
import { sphereGeometry } from "@/geometries/sphere";
import { superellipsoidGeometry } from "@/geometries/superellipsoid";
import { torusGeometry } from "@/geometries/torus";
import { torusKnotGeometry } from "@/geometries/torus-knot";
import type { GeometryDefinition } from "@/geometries/types";
import { waveSurfaceGeometry } from "@/geometries/wave-surface";

export const GEOMETRY_DEFINITIONS: readonly GeometryDefinition[] = [
  torusGeometry,
  sphereGeometry,
  mobiusGeometry,
  torusKnotGeometry,
  kleinBottleGeometry,
  superellipsoidGeometry,
  helicoidGeometry,
  doubleHelixGeometry,
  waveSurfaceGeometry,
  flowRibbonGeometry,
  heartSurfaceGeometry,
  galaxyVortexGeometry
];

const geometryById = new Map<ShapeId, GeometryDefinition>(
  GEOMETRY_DEFINITIONS.map((definition) => [definition.id, definition])
);

export function getGeometryDefinition(id: ShapeId): GeometryDefinition {
  return geometryById.get(id) ?? torusGeometry;
}
