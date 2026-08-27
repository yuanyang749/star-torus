import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import type { StarFieldConfig } from "@/domain/star-field";
import { DustTrailLayer, StarPointLayer } from "@/effects/RenderLayers";
import {
  GRID_COLUMNS,
  GRID_ROWS,
  POINT_COUNT,
  resolveGeometryDefinition,
  type GeometryDefinition
} from "@/geometries/types";
import {
  ENERGY_WAVE_BAND_WIDTH,
  ENERGY_WAVE_COUNT,
  type StarRuntime
} from "@/components/star-field/StarRuntime";
import { starFragmentShader, starVertexShader } from "@/components/star-field/starShaders";

const FLOW_PHASE_PER_SECOND = Math.PI / 40 * 1.2;
const BASE_SCENE_SCALE = 0.66;
const TRAIL_POINT_STEP = 2;
const TRAIL_SEGMENT_COUNT = Math.ceil(POINT_COUNT / TRAIL_POINT_STEP);
const TRAIL_VISIBILITY_THRESHOLD = 0.04;

interface StarParticlesProps {
  config: StarFieldConfig;
  geometries: readonly GeometryDefinition[];
  runtime: StarRuntime;
}

interface ParticleBuffers {
  geometry: THREE.BufferGeometry;
  trailGeometry: LineSegmentsGeometry;
  positions: Float32Array;
  basePositions: Float32Array;
  sourcePositions: Float32Array;
  targetPositions: Float32Array;
  previousPositions: Float32Array;
  pointSizes: Float32Array;
  baseSizes: Float32Array;
  sourceSizes: Float32Array;
  targetSizes: Float32Array;
  trailPositions: Float32Array;
  activeShape: StarFieldConfig["shape"];
  morphProgress: number;
}

export function StarParticles({ config, geometries, runtime }: StarParticlesProps) {
  const { size, viewport } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const [initialShape] = useState(config.shape);
  const buffers = useMemo(
    () => createParticleBuffers(resolveGeometryDefinition(geometries, initialShape)),
    [geometries, initialShape]
  );
  const waveData = useMemo(() => new Float32Array(ENERGY_WAVE_COUNT * 4), []);
  const waveVectors = useMemo(
    () => Array.from({ length: ENERGY_WAVE_COUNT }, () => new THREE.Vector4()),
    []
  );
  const starTarget = useMemo(() => new THREE.Color(config.theme.star), []);
  const glowTarget = useMemo(() => new THREE.Color(config.theme.glow), []);
  const material = useMemo(() => createStarMaterial(config, waveVectors), []);
  const trailMaterial = useMemo(
    () => new LineMaterial({
      color: config.theme.glow,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }),
    []
  );
  const trailObject = useMemo(() => {
    const object = new LineSegments2(buffers.trailGeometry, trailMaterial);
    object.name = "star-trails";
    object.frustumCulled = false;
    object.renderOrder = 0;
    return object;
  }, [buffers.trailGeometry, trailMaterial]);

  useEffect(() => {
    starTarget.set(config.theme.star);
    glowTarget.set(config.theme.glow);
    trailMaterial.color.set(config.theme.glow);
  }, [config.theme.glow, config.theme.star, glowTarget, starTarget, trailMaterial]);

  useEffect(() => {
    const nextShape = resolveGeometryDefinition(geometries, config.shape).id;
    if (buffers.activeShape === nextShape) return;
    buffers.sourcePositions.set(buffers.basePositions);
    buffers.sourceSizes.set(buffers.baseSizes);
    buffers.activeShape = nextShape;
    buffers.morphProgress = 0;
  }, [buffers, config.shape, geometries]);

  useEffect(() => () => {
    buffers.geometry.dispose();
    buffers.trailGeometry.dispose();
    material.dispose();
    trailMaterial.dispose();
  }, [buffers, material, trailMaterial]);

  useFrame((_, delta) => {
    runtime.setViewport(size.width, size.height);
    runtime.step(delta, performance.now());

    const phase = runtime.simulationSeconds * FLOW_PHASE_PER_SECOND;
    const definition = resolveGeometryDefinition(geometries, buffers.activeShape);
    definition.sample(buffers.targetPositions, buffers.targetSizes, {
      phase,
      columns: GRID_COLUMNS,
      rows: GRID_ROWS
    });

    if (buffers.morphProgress < 1) {
      const duration = Math.max(0.12, config.motion.morphDuration);
      buffers.morphProgress = Math.min(1, buffers.morphProgress + delta / duration);
      const eased = smoothstep(buffers.morphProgress);
      interpolateBuffers(
        buffers.basePositions,
        buffers.sourcePositions,
        buffers.targetPositions,
        eased
      );
      interpolateBuffers(buffers.baseSizes, buffers.sourceSizes, buffers.targetSizes, eased);
    } else {
      buffers.basePositions.set(buffers.targetPositions);
      buffers.baseSizes.set(buffers.targetSizes);
    }

    rotatePositions(
      buffers.basePositions,
      buffers.positions,
      runtime.rotationX + runtime.parallaxX,
      runtime.rotationY + runtime.parallaxY
    );
    buffers.pointSizes.set(buffers.baseSizes);
    updateTrails(
      buffers,
      runtime.trailStrength
    );

    const positionAttribute = buffers.geometry.getAttribute("position") as THREE.BufferAttribute;
    const sizeAttribute = buffers.geometry.getAttribute("aPointSize") as THREE.BufferAttribute;
    const trailAttribute = buffers.trailGeometry.getAttribute(
      "instanceStart"
    ) as THREE.InterleavedBufferAttribute;
    positionAttribute.needsUpdate = true;
    sizeAttribute.needsUpdate = true;
    trailAttribute.data.needsUpdate = runtime.trailStrength > TRAIL_VISIBILITY_THRESHOLD;

    const sceneScale = BASE_SCENE_SCALE * runtime.zoom * (1 + runtime.burstScale);
    pointsRef.current?.scale.setScalar(sceneScale);
    trailObject.scale.setScalar(sceneScale);

    const uniforms = material.uniforms;
    uniforms.uViewport.value.set(size.width, size.height);
    uniforms.uPointer.value.set(runtime.pointerX, runtime.pointerY);
    uniforms.uPixelRatio.value = viewport.dpr;
    uniforms.uPointScale.value = config.motion.pointScale;
    uniforms.uHoverRadius.value = config.effects.hoverRadius;
    uniforms.uLightStrength.value = runtime.lightStrength;
    uniforms.uMagnetStrength.value = runtime.magnetStrength;
    (uniforms.uStarColor.value as THREE.Color).lerp(starTarget, 1 - Math.pow(0.04, delta));
    (uniforms.uGlowColor.value as THREE.Color).lerp(glowTarget, 1 - Math.pow(0.04, delta));

    runtime.writeWaveData(waveData);
    for (let index = 0; index < ENERGY_WAVE_COUNT; index += 1) {
      const sourceIndex = index * 4;
      waveVectors[index].set(
        waveData[sourceIndex],
        waveData[sourceIndex + 1],
        waveData[sourceIndex + 2],
        waveData[sourceIndex + 3]
      );
    }

    trailMaterial.opacity = runtime.trailStrength > TRAIL_VISIBILITY_THRESHOLD
      ? 0.055 + runtime.trailStrength * 0.285
      : 0;
    trailMaterial.uniforms.linewidth.value = (
      0.58 + runtime.trailStrength * 0.88
    ) * viewport.dpr;
  });

  return (
    <>
      <DustTrailLayer
        object={trailObject}
      />
      <StarPointLayer
        objectRef={pointsRef}
        geometry={buffers.geometry}
        material={material}
      />
    </>
  );
}

function createParticleBuffers(definition: GeometryDefinition): ParticleBuffers {
  const positions = new Float32Array(POINT_COUNT * 3);
  const basePositions = new Float32Array(POINT_COUNT * 3);
  const sourcePositions = new Float32Array(POINT_COUNT * 3);
  const targetPositions = new Float32Array(POINT_COUNT * 3);
  const previousPositions = new Float32Array(POINT_COUNT * 3);
  const pointSizes = new Float32Array(POINT_COUNT);
  const baseSizes = new Float32Array(POINT_COUNT);
  const sourceSizes = new Float32Array(POINT_COUNT);
  const targetSizes = new Float32Array(POINT_COUNT);
  const trailPositions = new Float32Array(TRAIL_SEGMENT_COUNT * 6);
  definition.sample(basePositions, baseSizes, {
    phase: 0,
    columns: GRID_COLUMNS,
    rows: GRID_ROWS
  });
  positions.set(basePositions);
  sourcePositions.set(basePositions);
  targetPositions.set(basePositions);
  pointSizes.set(baseSizes);
  sourceSizes.set(baseSizes);
  targetSizes.set(baseSizes);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aPointSize", new THREE.BufferAttribute(pointSizes, 1));

  const trailGeometry = new LineSegmentsGeometry();
  trailGeometry.setPositions(trailPositions);

  return {
    geometry,
    trailGeometry,
    positions,
    basePositions,
    sourcePositions,
    targetPositions,
    previousPositions,
    pointSizes,
    baseSizes,
    sourceSizes,
    targetSizes,
    trailPositions,
    activeShape: definition.id,
    morphProgress: 1
  };
}

function createStarMaterial(
  config: StarFieldConfig,
  waveVectors: THREE.Vector4[]
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uViewport: { value: new THREE.Vector2(720, 720) },
      uPointer: { value: new THREE.Vector2(360, 360) },
      uPixelRatio: { value: 1 },
      uPointScale: { value: config.motion.pointScale },
      uHoverRadius: { value: config.effects.hoverRadius },
      uLightStrength: { value: 0 },
      uMagnetStrength: { value: 0 },
      uWaveBand: { value: ENERGY_WAVE_BAND_WIDTH },
      uWaves: { value: waveVectors },
      uStarColor: { value: new THREE.Color(config.theme.star) },
      uGlowColor: { value: new THREE.Color(config.theme.glow) }
    },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending
  });
}

function interpolateBuffers(
  output: Float32Array,
  from: Float32Array,
  to: Float32Array,
  progress: number
): void {
  for (let index = 0; index < output.length; index += 1) {
    output[index] = from[index] + (to[index] - from[index]) * progress;
  }
}

function rotatePositions(
  source: Float32Array,
  output: Float32Array,
  rotationX: number,
  rotationY: number
): void {
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);

  for (let index = 0; index < POINT_COUNT; index += 1) {
    const positionIndex = index * 3;
    const x = source[positionIndex];
    const y = source[positionIndex + 1];
    const z = source[positionIndex + 2];
    const rotatedX = x * cosY + z * sinY;
    const yAfterX = -x * sinY + z * cosY;
    output[positionIndex] = rotatedX;
    // Match the original Canvas projection, whose positive Y axis points down.
    output[positionIndex + 1] = -(y * cosX - yAfterX * sinX);
    output[positionIndex + 2] = y * sinX + yAfterX * cosX;
  }
}

function updateTrails(
  buffers: ParticleBuffers,
  strength: number
): void {
  if (strength > TRAIL_VISIBILITY_THRESHOLD) {
    const maxLength = (12 + strength * 24) / BASE_SCENE_SCALE;
    const maxFrameDistance = 60 / BASE_SCENE_SCALE;
    let segmentIndex = 0;

    for (let pointIndex = 0; pointIndex < POINT_COUNT; pointIndex += TRAIL_POINT_STEP) {
      const positionIndex = pointIndex * 3;
      const trailIndex = segmentIndex * 6;
      const currentX = buffers.positions[positionIndex];
      const currentY = buffers.positions[positionIndex + 1];
      const currentZ = buffers.positions[positionIndex + 2];
      const deltaX = currentX - buffers.previousPositions[positionIndex];
      const deltaY = currentY - buffers.previousPositions[positionIndex + 1];
      const deltaZ = currentZ - buffers.previousPositions[positionIndex + 2];
      const distance = Math.hypot(deltaX, deltaY, deltaZ);
      const validDistance = distance >= 0.001 && distance <= maxFrameDistance;
      const stretch = validDistance
        ? Math.min(1.05 + strength * 3.5, maxLength / distance)
        : 0;

      buffers.trailPositions[trailIndex] = currentX - deltaX * stretch;
      buffers.trailPositions[trailIndex + 1] = currentY - deltaY * stretch;
      buffers.trailPositions[trailIndex + 2] = currentZ - deltaZ * stretch;
      buffers.trailPositions[trailIndex + 3] = currentX;
      buffers.trailPositions[trailIndex + 4] = currentY;
      buffers.trailPositions[trailIndex + 5] = currentZ;
      segmentIndex += 1;
    }
  }

  // The original Canvas effect measured displacement against the actual previous frame.
  buffers.previousPositions.set(buffers.positions);
}

function smoothstep(value: number): number {
  return value * value * (3 - value * 2);
}
