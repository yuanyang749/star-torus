import type { ShapeId } from "@/domain/star-field";

export interface GeometryDistribution {
  registryName: string;
  moduleName: string;
  exportName: string;
}

export const GEOMETRY_DISTRIBUTION = {
  torus: {
    registryName: "geometry-torus",
    moduleName: "torus",
    exportName: "torusGeometry"
  },
  sphere: {
    registryName: "geometry-sphere",
    moduleName: "sphere",
    exportName: "sphereGeometry"
  },
  mobius: {
    registryName: "geometry-mobius",
    moduleName: "mobius",
    exportName: "mobiusGeometry"
  },
  "torus-knot": {
    registryName: "geometry-torus-knot",
    moduleName: "torus-knot",
    exportName: "torusKnotGeometry"
  },
  klein: {
    registryName: "geometry-klein-bottle",
    moduleName: "klein-bottle",
    exportName: "kleinBottleGeometry"
  },
  superellipsoid: {
    registryName: "geometry-superellipsoid",
    moduleName: "superellipsoid",
    exportName: "superellipsoidGeometry"
  },
  helicoid: {
    registryName: "geometry-helicoid",
    moduleName: "helicoid",
    exportName: "helicoidGeometry"
  },
  "double-helix": {
    registryName: "geometry-double-helix",
    moduleName: "double-helix",
    exportName: "doubleHelixGeometry"
  },
  "wave-surface": {
    registryName: "geometry-wave-surface",
    moduleName: "wave-surface",
    exportName: "waveSurfaceGeometry"
  },
  "flow-ribbon": {
    registryName: "geometry-flow-ribbon",
    moduleName: "flow-ribbon",
    exportName: "flowRibbonGeometry"
  },
  heart: {
    registryName: "geometry-heart-surface",
    moduleName: "heart-surface",
    exportName: "heartSurfaceGeometry"
  },
  galaxy: {
    registryName: "geometry-galaxy-vortex",
    moduleName: "galaxy-vortex",
    exportName: "galaxyVortexGeometry"
  }
} satisfies Record<ShapeId, GeometryDistribution>;
