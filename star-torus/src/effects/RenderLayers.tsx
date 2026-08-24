import type { RefObject } from "react";
import * as THREE from "three";

interface DustTrailLayerProps {
  objectRef: RefObject<THREE.LineSegments | null>;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
}

export function DustTrailLayer({ objectRef, geometry, material }: DustTrailLayerProps) {
  return (
    <lineSegments
      ref={objectRef}
      name="star-trails"
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={0}
    />
  );
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
