import type { RefObject } from "react";
import * as THREE from "three";
import type { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";

interface DustTrailLayerProps {
  object: LineSegments2;
}

export function DustTrailLayer({ object }: DustTrailLayerProps) {
  return <primitive object={object} />;
}

interface StarPointLayerProps {
  objectRef: RefObject<THREE.Points | null>;
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
}

export function StarPointLayer({ objectRef, geometry, material }: StarPointLayerProps) {
  return (
    <points
      ref={objectRef}
      name="star-points"
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={1}
    />
  );
}
