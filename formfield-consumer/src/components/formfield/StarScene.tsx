import { useEffect, useMemo, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { RuntimeStatus, StarFieldConfig } from "@/components/formfield/domain";
import type { GeometryDefinition } from "@/components/formfield/geometries/types";
import { StarParticles } from "@/components/formfield/StarParticles";
import { StarRuntime } from "@/components/formfield/StarRuntime";

export interface StarFieldController {
  resetView(): void;
}

interface StarSceneProps {
  config: StarFieldConfig;
  geometries: readonly GeometryDefinition[];
  controllerRef: MutableRefObject<StarFieldController | null>;
  onRuntimeStatusChange?: (status: RuntimeStatus) => void;
}

export function StarScene({
  config,
  geometries,
  controllerRef,
  onRuntimeStatusChange
}: StarSceneProps) {
  const runtime = useMemo(() => new StarRuntime(config, onRuntimeStatusChange), []);

  useEffect(() => {
    runtime.setConfig(config);
  }, [config, runtime]);

  useEffect(() => {
    runtime.setStatusListener(onRuntimeStatusChange);
  }, [onRuntimeStatusChange, runtime]);

  useEffect(() => {
    controllerRef.current = {
      resetView: () => runtime.resetView()
    };
    return () => {
      controllerRef.current = null;
    };
  }, [controllerRef, runtime]);

  return (
    <>
      <SceneBindings config={config} runtime={runtime} />
      <StarParticles config={config} geometries={geometries} runtime={runtime} />
    </>
  );
}

function SceneBindings({ config, runtime }: { config: StarFieldConfig; runtime: StarRuntime }) {
  const { gl, scene } = useThree();
  const backgroundTarget = useMemo(() => new THREE.Color(config.theme.background), []);

  useEffect(() => runtime.attach(gl.domElement), [gl, runtime]);

  useEffect(() => {
    backgroundTarget.set(config.theme.background);
  }, [backgroundTarget, config.theme.background]);

  useEffect(() => {
    if (!(scene.background instanceof THREE.Color)) {
      scene.background = new THREE.Color(config.theme.background);
    }
  }, [config.theme.background, scene]);

  useFrame((_, delta) => {
    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(backgroundTarget, 1 - Math.pow(0.04, delta));
    }
  }, -1);

  return null;
}
