import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties
} from "react";
import { Canvas } from "@react-three/fiber";
import type { RuntimeStatus, StarFieldConfig } from "@/components/formfield/domain";
import {
  resolveGeometryDefinition,
  type GeometryDefinition
} from "@/components/formfield/geometries/types";
import { StarScene, type StarFieldController } from "@/components/formfield/StarScene";
import "@/components/formfield/star-field.css";

export interface StarFieldHandle {
  resetView(): void;
}

export interface StarFieldProps {
  config: StarFieldConfig;
  geometries: readonly GeometryDefinition[];
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  onRuntimeStatusChange?: (status: RuntimeStatus) => void;
}

export const StarField = forwardRef<StarFieldHandle, StarFieldProps>(function StarField(
  { config, geometries, ariaLabel, className = "", style, onRuntimeStatusChange },
  forwardedRef
) {
  const controllerRef = useRef<StarFieldController | null>(null);
  const definition = resolveGeometryDefinition(geometries, config.shape);

  useImperativeHandle(forwardedRef, () => ({
    resetView: () => controllerRef.current?.resetView()
  }), []);

  return (
    <div
      className={`star-field ${className}`.trim()}
      style={{ background: config.theme.background, ...style }}
      role="img"
      aria-label={ariaLabel ?? definition.ariaLabel}
    >
      <Canvas
        camera={{ fov: 60, near: 1, far: 1600, position: [0, 0, 519.615] }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        performance={{ min: 0.65 }}
      >
        <StarScene
          config={config}
          geometries={geometries}
          controllerRef={controllerRef}
          onRuntimeStatusChange={onRuntimeStatusChange}
        />
      </Canvas>
    </div>
  );
});
