export const runtimeFiles = [
  ["src/components/star-field/StarField.tsx", "components/formfield/StarField.tsx", "registry:component"],
  ["src/components/star-field/StarParticles.tsx", "components/formfield/StarParticles.tsx", "registry:component"],
  ["src/components/star-field/StarRuntime.ts", "components/formfield/StarRuntime.ts", "registry:file"],
  ["src/components/star-field/StarScene.tsx", "components/formfield/StarScene.tsx", "registry:component"],
  ["src/components/star-field/starShaders.ts", "components/formfield/starShaders.ts", "registry:file"],
  ["src/components/star-field/star-field.css", "components/formfield/star-field.css", "registry:style"],
  ["src/components/star-field/index.ts", "components/formfield/index.ts", "registry:file"],
  ["src/domain/star-field.ts", "components/formfield/domain.ts", "registry:file"],
  ["src/effects/RenderLayers.tsx", "components/formfield/effects/RenderLayers.tsx", "registry:component"],
  ["src/effects/registry.ts", "components/formfield/effects/registry.ts", "registry:file"],
  ["src/geometries/types.ts", "components/formfield/geometries/types.ts", "registry:file"]
];

export const geometryItems = [
  { name: "geometry-torus", shape: "torus", title: "星环几何", moduleName: "torus", exportName: "torusGeometry" },
  { name: "geometry-sphere", shape: "sphere", title: "球体几何", moduleName: "sphere", exportName: "sphereGeometry" },
  { name: "geometry-mobius", shape: "mobius", title: "莫比乌斯几何", moduleName: "mobius", exportName: "mobiusGeometry" },
  { name: "geometry-torus-knot", shape: "torus-knot", title: "三叶环面结几何", moduleName: "torus-knot", exportName: "torusKnotGeometry" },
  { name: "geometry-klein-bottle", shape: "klein", title: "克莱因瓶几何", moduleName: "klein-bottle", exportName: "kleinBottleGeometry" },
  { name: "geometry-superellipsoid", shape: "superellipsoid", title: "超椭球几何", moduleName: "superellipsoid", exportName: "superellipsoidGeometry" },
  { name: "geometry-helicoid", shape: "helicoid", title: "螺旋曲面几何", moduleName: "helicoid", exportName: "helicoidGeometry" },
  { name: "geometry-double-helix", shape: "double-helix", title: "双螺旋几何", moduleName: "double-helix", exportName: "doubleHelixGeometry" },
  { name: "geometry-wave-surface", shape: "wave-surface", title: "波浪马鞍面几何", moduleName: "wave-surface", exportName: "waveSurfaceGeometry" },
  { name: "geometry-flow-ribbon", shape: "flow-ribbon", title: "流光丝带几何", moduleName: "flow-ribbon", exportName: "flowRibbonGeometry" },
  { name: "geometry-heart-surface", shape: "heart", title: "心形曲面几何", moduleName: "heart-surface", exportName: "heartSurfaceGeometry" },
  { name: "geometry-galaxy-vortex", shape: "galaxy", title: "星系漩涡几何", moduleName: "galaxy-vortex", exportName: "galaxyVortexGeometry" }
];

export const visualPresets = [
  ["star-torus", "StarTorus", "星环", "torus"],
  ["particle-sphere", "ParticleSphere", "粒子球体", "sphere"],
  ["mobius-field", "MobiusField", "莫比乌斯形场", "mobius"],
  ["torus-knot", "TorusKnotField", "三叶环面结", "torus-knot"],
  ["klein-bottle", "KleinBottleField", "克莱因瓶", "klein"],
  ["superellipsoid", "SuperellipsoidField", "超椭球", "superellipsoid"],
  ["helicoid", "HelicoidField", "螺旋曲面", "helicoid"],
  ["double-helix", "DoubleHelixField", "双螺旋", "double-helix"],
  ["wave-surface", "WaveSurfaceField", "波浪马鞍面", "wave-surface"],
  ["flow-ribbon", "FlowRibbonField", "流光丝带", "flow-ribbon"],
  ["heart-surface", "HeartSurfaceField", "心形曲面", "heart"],
  ["galaxy-vortex", "GalaxyVortexField", "星系漩涡", "galaxy"]
];

export function createPresetConfig(shape) {
  return {
    version: 1,
    shape,
    theme: {
      background: "#000000",
      star: "#FFFFFF",
      glow: "#FFFFFF"
    },
    motion: {
      flowSpeed: 1,
      pointScale: 1,
      morphDuration: 1.35
    },
    effects: {
      hoverRadius: 220,
      hoverIntensity: 1,
      trailIntensity: 1
    },
    interaction: {
      enabled: false,
      holdMode: "magnet"
    }
  };
}
