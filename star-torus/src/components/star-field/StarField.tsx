import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties
} from "react";
import { Canvas } from "@react-three/fiber";
import type { RuntimeStatus, StarFieldConfig } from "@/domain/star-field";
import { getGeometryDefinition } from "@/geometries/registry";
import { StarScene, type StarFieldController } from "@/components/star-field/StarScene";

export interface StarFieldHandle {
  resetView(): void;
}

export interface StarFieldProps {
  config: StarFieldConfig;
  className?: string;
  style?: CSSProperties;
  onRuntimeStatusChange?: (status: RuntimeStatus) => void;
}

export const StarField = forwardRef<StarFieldHandle, StarFieldProps>(function StarField(
  { config, className = "", style, onRuntimeStatusChange },
  forwardedRef
) {
  const controllerRef = useRef<StarFieldController | null>(null);
  const definition = getGeometryDefinition(config.shape);

  useImperativeHandle(forwardedRef, () => ({
    resetView: () => controllerRef.current?.resetView()
  }), []);

  return (
    <div
      className={`star-field ${className}`.trim()}
      style={{ background: config.theme.background, ...style }}
      role="img"
      aria-label={definition.ariaLabel}
    >
      <Canvas
        camera={{ fov: 60, near: 1, far: 1600, position: [0, 0, 519.615] }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        performance={{ min: 0.65 }}
      >
        <StarScene
          config={config}
          controllerRef={controllerRef}
          onRuntimeStatusChange={onRuntimeStatusChange}
        />
      </Canvas>
    </div>
  );
});
