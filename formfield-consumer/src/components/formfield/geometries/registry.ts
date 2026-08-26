import type { ShapeId } from "@/components/formfield/domain";
import { doubleHelixGeometry } from "@/components/formfield/geometries/double-helix";
import { flowRibbonGeometry } from "@/components/formfield/geometries/flow-ribbon";
import { galaxyVortexGeometry } from "@/components/formfield/geometries/galaxy-vortex";
import { heartSurfaceGeometry } from "@/components/formfield/geometries/heart-surface";
import { helicoidGeometry } from "@/components/formfield/geometries/helicoid";
import { kleinBottleGeometry } from "@/components/formfield/geometries/klein-bottle";
import { mobiusGeometry } from "@/components/formfield/geometries/mobius";
import { sphereGeometry } from "@/components/formfield/geometries/sphere";
import { superellipsoidGeometry } from "@/components/formfield/geometries/superellipsoid";
import { torusGeometry } from "@/components/formfield/geometries/torus";
import { torusKnotGeometry } from "@/components/formfield/geometries/torus-knot";
import type { GeometryDefinition } from "@/components/formfield/geometries/types";
import { waveSurfaceGeometry } from "@/components/formfield/geometries/wave-surface";

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
