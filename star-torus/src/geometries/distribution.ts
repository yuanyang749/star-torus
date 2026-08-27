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
  },
  "network-globe": {
    registryName: "geometry-network-globe",
    moduleName: "network-globe",
    exportName: "networkGlobeGeometry"
  },
  "particle-logo": {
    registryName: "geometry-particle-logo",
    moduleName: "particle-logo",
    exportName: "particleLogoGeometry"
  },
  "light-tunnel": {
    registryName: "geometry-light-tunnel",
    moduleName: "light-tunnel",
    exportName: "lightTunnelGeometry"
  },
  "lissajous-orbit": {
    registryName: "geometry-lissajous-orbit",
    moduleName: "lissajous-orbit",
    exportName: "lissajousOrbitGeometry"
  },
  gyroid: {
    registryName: "geometry-gyroid",
    moduleName: "gyroid",
    exportName: "gyroidGeometry"
  },
  metaball: {
    registryName: "geometry-metaball",
    moduleName: "metaball",
    exportName: "metaballGeometry"
  },
  "particle-terrain": {
    registryName: "geometry-particle-terrain",
    moduleName: "particle-terrain",
    exportName: "particleTerrainGeometry"
  },
  "dna-ring": {
    registryName: "geometry-dna-ring",
    moduleName: "dna-ring",
    exportName: "dnaRingGeometry"
  }
} satisfies Record<ShapeId, GeometryDistribution>;
