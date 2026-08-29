import type { ShapeId } from "@/domain/star-field";
import { celestialGyroGeometry } from "@/geometries/celestial-gyro";
import { dnaRingGeometry } from "@/geometries/dna-ring";
import { doubleHelixGeometry } from "@/geometries/double-helix";
import { flowRibbonGeometry } from "@/geometries/flow-ribbon";
import { galaxyVortexGeometry } from "@/geometries/galaxy-vortex";
import { heartSurfaceGeometry } from "@/geometries/heart-surface";
import { helicoidGeometry } from "@/geometries/helicoid";
import { kleinBottleGeometry } from "@/geometries/klein-bottle";
import { lightTunnelGeometry } from "@/geometries/light-tunnel";
import { lissajousOrbitGeometry } from "@/geometries/lissajous-orbit";
import { metaballGeometry } from "@/geometries/metaball";
import { mobiusGeometry } from "@/geometries/mobius";
import { networkGlobeGeometry } from "@/geometries/network-globe";
import { particleLogoGeometry } from "@/geometries/particle-logo";
import { particleTerrainGeometry } from "@/geometries/particle-terrain";
import { singularityGeometry } from "@/geometries/singularity";
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
  galaxyVortexGeometry,
  networkGlobeGeometry,
  particleLogoGeometry,
  lightTunnelGeometry,
  lissajousOrbitGeometry,
  celestialGyroGeometry,
  singularityGeometry,
  metaballGeometry,
  particleTerrainGeometry,
  dnaRingGeometry
];

const geometryById = new Map<ShapeId, GeometryDefinition>(
  GEOMETRY_DEFINITIONS.map((definition) => [definition.id, definition])
);

export function getGeometryDefinition(id: ShapeId): GeometryDefinition {
  return geometryById.get(id) ?? torusGeometry;
}
