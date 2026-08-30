import type { GeometryDefinition } from "@/components/formfield/geometries/types";

const TAU = Math.PI * 2;
const GIMBAL_COUNT = 3;
const OUTER_RADIUS = 188;
const MIDDLE_RADIUS = 142;
const INNER_RADIUS = 98;
const CORE_RADIUS = 36;

export const celestialGyroGeometry: GeometryDefinition = {
  id: "celestial-gyro",
  label: "浑天仪",
  ariaLabel: "由三轴正交同心万向旋转星环与核心恒星核组成的浑天星仪",
  mark: "celestial-gyro",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const pointCount = columns * rows;
    const gimbalPoints = Math.floor(pointCount * 0.72);
    const pointsPerGimbal = Math.floor(gimbalPoints / GIMBAL_COUNT);
    const corePoints = Math.floor(pointCount * 0.18);
    const axisPoints = pointCount - pointsPerGimbal * GIMBAL_COUNT - corePoints;

    // 三个环共享同一旋转矩阵，因此其基准法向量始终保持两两正交。
    const rotationX = 0.42 + phase * 0.08;
    const rotationY = -0.55 + phase * 0.13;
    const rotationZ = 0.18 - phase * 0.05;
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosZ = Math.cos(rotationZ);
    const sinZ = Math.sin(rotationZ);
    const m00 = cosZ * cosY;
    const m01 = cosZ * sinY * sinX - sinZ * cosX;
    const m02 = cosZ * sinY * cosX + sinZ * sinX;
    const m10 = sinZ * cosY;
    const m11 = sinZ * sinY * sinX + cosZ * cosX;
    const m12 = sinZ * sinY * cosX - cosZ * sinX;
    const m20 = -sinY;
    const m21 = cosY * sinX;
    const m22 = cosY * cosX;

    let cursor = 0;

    // 1. 三轴嵌套正交万向陀螺星环 (3 Orthogonal Nested Gimbal Rings)
    for (let gimbal = 0; gimbal < GIMBAL_COUNT; gimbal += 1) {
      const radius = gimbal === 0 ? OUTER_RADIUS : gimbal === 1 ? MIDDLE_RADIUS : INNER_RADIUS;
      const speed = gimbal === 0 ? 0.8 : gimbal === 1 ? -1.15 : 1.45;
      const nodeStride = Math.max(1, Math.floor(pointsPerGimbal / 8));

      for (let i = 0; i < pointsPerGimbal && cursor < pointCount; i += 1) {
        const progress = i / pointsPerGimbal;
        const theta = progress * TAU + phase * speed;

        // 环面微带厚度 (tubular spread)
        const tubePhase = progress * TAU * 12 + phase * 2;
        const tubeRadius = (4.5 + gimbal * 1.5) * (1 + Math.sin(tubePhase) * 0.25);
        const tubeTheta = (i % 8) / 8 * TAU;

        // 分别构造 XY、YZ、XZ 三个正交基准环面。
        const radial = radius + tubeRadius * Math.cos(tubeTheta);
        const tubeDepth = tubeRadius * Math.sin(tubeTheta);
        const ringCos = radial * Math.cos(theta);
        const ringSin = radial * Math.sin(theta);
        const x = gimbal === 1 ? tubeDepth : ringCos;
        const y = gimbal === 0 ? ringSin : gimbal === 1 ? ringCos : tubeDepth;
        const z = gimbal === 0 ? tubeDepth : ringSin;

        const posIdx = cursor * 3;
        positions[posIdx] = m00 * x + m01 * y + m02 * z;
        positions[posIdx + 1] = m10 * x + m11 * y + m12 * z;
        positions[posIdx + 2] = m20 * x + m21 * y + m22 * z;

        const isNode = i % nodeStride === 0;
        pointSizes[cursor] = isNode
          ? 0.92 + Math.sin(phase * 4 + gimbal) * 0.25
          : 0.52 + (GIMBAL_COUNT - gimbal) * 0.08 + Math.sin(theta * 3 - phase) * 0.1;

        cursor += 1;
      }
    }

    // 2. 核心悬浮恒星核 (Central Pulsing Stellar Nucleus Sphere)
    const phiStep = Math.PI * (3 - Math.sqrt(5)); // 黄金角
    const corePulse = 1 + Math.sin(phase * 3.5) * 0.16;

    for (let i = 0; i < corePoints && cursor < pointCount; i += 1) {
      const yNorm = corePoints === 1 ? 0 : 1 - (i / (corePoints - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
      const theta = phiStep * i + phase * 1.2;
      const currentRadius = CORE_RADIUS * corePulse * (0.88 + (i % 5) * 0.06);

      const posIdx = cursor * 3;
      positions[posIdx] = Math.cos(theta) * radiusAtY * currentRadius;
      positions[posIdx + 1] = yNorm * currentRadius;
      positions[posIdx + 2] = Math.sin(theta) * radiusAtY * currentRadius;

      pointSizes[cursor] = 0.65 + Math.sin(theta * 2 + phase * 3) * 0.28;
      cursor += 1;
    }

    // 3. 极轴连贯导光轴 (Polar Axial Beams)
    for (let i = 0; i < axisPoints && cursor < pointCount; i += 1) {
      const progress = axisPoints === 1 ? 0 : (i / (axisPoints - 1)) * 2 - 1;
      const sign = Math.sign(progress) || 1;
      const height = progress * OUTER_RADIUS * 1.18;
      const spiralTheta = progress * TAU * 4 + phase * 2.5;
      const spiralRadius = Math.sin(Math.abs(progress) * Math.PI) * 14;
      const x = Math.cos(spiralTheta) * spiralRadius;
      const y = height;
      const z = Math.sin(spiralTheta) * spiralRadius;

      const posIdx = cursor * 3;
      positions[posIdx] = m00 * x + m01 * y + m02 * z;
      positions[posIdx + 1] = m10 * x + m11 * y + m12 * z;
      positions[posIdx + 2] = m20 * x + m21 * y + m22 * z;

      pointSizes[cursor] = 0.45 + (1 - Math.abs(progress)) * 0.35 + Math.sin(phase * 4 + sign) * 0.15;
      cursor += 1;
    }

    // 补齐边界
    while (cursor < pointCount) {
      const posIdx = cursor * 3;
      positions[posIdx] = 0;
      positions[posIdx + 1] = 0;
      positions[posIdx + 2] = 0;
      pointSizes[cursor] = 0.5;
      cursor += 1;
    }
  }
};
