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
  ["src/geometries/types.ts", "components/formfield/geometries/types.ts", "registry:file"],
  ["src/geometries/registry.ts", "components/formfield/geometries/registry.ts", "registry:file"],
  ["src/geometries/torus.ts", "components/formfield/geometries/torus.ts", "registry:file"],
  ["src/geometries/sphere.ts", "components/formfield/geometries/sphere.ts", "registry:file"],
  ["src/geometries/mobius.ts", "components/formfield/geometries/mobius.ts", "registry:file"],
  ["src/geometries/torus-knot.ts", "components/formfield/geometries/torus-knot.ts", "registry:file"],
  ["src/geometries/klein-bottle.ts", "components/formfield/geometries/klein-bottle.ts", "registry:file"],
  ["src/geometries/superellipsoid.ts", "components/formfield/geometries/superellipsoid.ts", "registry:file"],
  ["src/geometries/helicoid.ts", "components/formfield/geometries/helicoid.ts", "registry:file"],
  ["src/geometries/double-helix.ts", "components/formfield/geometries/double-helix.ts", "registry:file"],
  ["src/geometries/wave-surface.ts", "components/formfield/geometries/wave-surface.ts", "registry:file"],
  ["src/geometries/flow-ribbon.ts", "components/formfield/geometries/flow-ribbon.ts", "registry:file"],
  ["src/geometries/heart-surface.ts", "components/formfield/geometries/heart-surface.ts", "registry:file"],
  ["src/geometries/galaxy-vortex.ts", "components/formfield/geometries/galaxy-vortex.ts", "registry:file"]
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
