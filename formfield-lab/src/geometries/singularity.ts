import type { GeometryDefinition } from "@/geometries/types";

const TAU = Math.PI * 2;
const DISK_INNER_RADIUS = 46;
const DISK_OUTER_RADIUS = 216;
const PHOTON_RING_RADIUS = 52;
const JET_MAX_HEIGHT = 224;

export const singularityGeometry: GeometryDefinition = {
  id: "singularity",
  label: "奇点",
  ariaLabel: "由引力透镜弯曲光子环、相对论吸积盘与双极喷流构成的时空奇点",
  mark: "singularity",
  sample(positions, pointSizes, { phase, columns, rows }) {
    const pointCount = columns * rows;
    const diskPoints = Math.floor(pointCount * 0.52);
    const photonRingPoints = Math.floor(pointCount * 0.22);
    const jetPoints = Math.floor(pointCount * 0.20);
    const horizonPoints = pointCount - diskPoints - photonRingPoints - jetPoints;

    let cursor = 0;

    // 1. 广义相对论吸积盘涡流 (Relativistic Swirling Accretion Disk with Warp)
    for (let i = 0; i < diskPoints && cursor < pointCount; i += 1) {
      const diskProgress = diskPoints === 1 ? 0 : i / (diskPoints - 1);
      const radiusNorm = Math.pow(diskProgress, 1.45); // 靠近奇点更密集
      const r = DISK_INNER_RADIUS + radiusNorm * (DISK_OUTER_RADIUS - DISK_INNER_RADIUS);
      // 开普勒差动自转速度：角速度与半径的 -3/2 次方成正比
      const angularSpeed = Math.pow(DISK_INNER_RADIUS / r, 1.5) * 3.6;
      const armOffset = ((i % 4) / 4) * TAU;
      const theta = armOffset + Math.log(r / DISK_INNER_RADIUS) * 2.8 + phase * angularSpeed;

      // 吸积盘的视觉化垂直弯曲与波动 (Stylized gravity well dip)
      const gravityDip = -Math.exp(-r * 0.024) * 32;
      const wave = Math.sin(r * 0.05 - phase * 2.5 + armOffset) * (6 + radiusNorm * 12);
      const verticalWarp = gravityDip + wave;

      // 相对论多普勒因子 δ = 1 / [γ(1 - β cos α)]。
      const orbitalBeta = 0.22 + (1 - radiusNorm) * 0.38;
      const gamma = 1 / Math.sqrt(1 - orbitalBeta * orbitalBeta);
      const lineOfSightBeta = orbitalBeta * Math.cos(theta) * Math.sin(0.62);
      const dopplerFactor = 1 / (gamma * (1 - lineOfSightBeta));

      const posIdx = cursor * 3;
      positions[posIdx] = Math.cos(theta) * r;
      positions[posIdx + 1] = verticalWarp;
      positions[posIdx + 2] = Math.sin(theta) * r * 0.88;

      pointSizes[cursor] = (0.42 + (1 - radiusNorm) * 0.48) * dopplerFactor;
      cursor += 1;
    }

    // 2. 引力透镜光子环 (Gravitational Lensing Photon Ring - Warped over the event horizon)
    for (let i = 0; i < photonRingPoints && cursor < pointCount; i += 1) {
      const progress = i / photonRingPoints;
      const theta = progress * TAU;
      const orbitSpeed = phase * 4.2;
      const ringAngle = theta + orbitSpeed;

      // 光子环在强引力场下的上下对称弯曲环（爱因斯坦交叉环光晕）
      const ringRadius = PHOTON_RING_RADIUS * (1 + Math.sin(progress * TAU * 3 + phase) * 0.08);
      const isTopLobe = (i % 2 === 0);
      const lobeSign = isTopLobe ? 1 : -1;

      // 沿垂直轴弯折的 3D 拱门环形
      const arcTheta = progress * Math.PI;
      const x = Math.cos(ringAngle) * ringRadius;
      const y = lobeSign * Math.sin(arcTheta) * (ringRadius * 1.12);
      const z = Math.sin(ringAngle) * ringRadius * 0.35 + lobeSign * Math.sin(arcTheta) * 38;

      const posIdx = cursor * 3;
      positions[posIdx] = x;
      positions[posIdx + 1] = y;
      positions[posIdx + 2] = z;

      pointSizes[cursor] = 0.68 + Math.sin(ringAngle * 4 - phase * 3) * 0.28;
      cursor += 1;
    }

    // 3. 南北双极相对论等离子喷流 (Bipolar Relativistic Jets)
    const jetHalf = Math.floor(jetPoints / 2);
    for (let i = 0; i < jetPoints && cursor < pointCount; i += 1) {
      const isNorth = i < jetHalf;
      const subIdx = isNorth ? i : i - jetHalf;
      const jetProgress = jetHalf <= 1 ? 0 : subIdx / (jetHalf - 1); // 0 to 1
      const sign = isNorth ? 1 : -1;

      // 喷流随高度扩散且呈双螺旋旋转 (Helical relativistic cone expansion)
      const height = sign * (18 + Math.pow(jetProgress, 1.25) * JET_MAX_HEIGHT);
      const jetRadius = 4 + Math.pow(jetProgress, 0.72) * 34;
      const helixTheta = jetProgress * TAU * 5 + phase * 6.5 * sign;

      const posIdx = cursor * 3;
      positions[posIdx] = Math.cos(helixTheta) * jetRadius;
      positions[posIdx + 1] = height;
      positions[posIdx + 2] = Math.sin(helixTheta) * jetRadius;

      // 喷流根部高能密集，末端发散
      pointSizes[cursor] = (0.85 - jetProgress * 0.45) + Math.sin(helixTheta + phase * 4) * 0.18;
      cursor += 1;
    }

    // 4. 事件视界边界光圈 (Event Horizon Boundary Shell)
    for (let i = 0; i < horizonPoints && cursor < pointCount; i += 1) {
      const progress = i / horizonPoints;
      const theta = progress * TAU + phase * 1.8;
      const horizonRadius = DISK_INNER_RADIUS * 0.88;

      const posIdx = cursor * 3;
      positions[posIdx] = Math.cos(theta) * horizonRadius;
      positions[posIdx + 1] = Math.sin(theta * 3 + phase * 2) * 6;
      positions[posIdx + 2] = Math.sin(theta) * horizonRadius * 0.92;

      pointSizes[cursor] = 0.72 + Math.sin(theta * 6) * 0.22;
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
