import {
  resolveInteractionActions,
  type StarFieldConfig
} from "@/domain/star-field";

export type EffectId = "hover-light" | "dust-trail" | "energy-pulse";

export interface EffectDefinition {
  id: EffectId;
  label: string;
  description: string;
  isEnabled(config: StarFieldConfig): boolean;
}

export const EFFECT_DEFINITIONS: readonly EffectDefinition[] = [
  {
    id: "hover-light",
    label: "局部打光",
    description: "根据屏幕空间指针距离，只增强星场上的粒子。",
    isEnabled: (config) => config.effects.hoverIntensity > 0
      && resolveInteractionActions(config.interaction).hoverLight
  },
  {
    id: "dust-trail",
    label: "方向尾迹",
    description: "仅在拖拽速度超过阈值时渲染稀疏线段。",
    isEnabled: (config) => config.effects.trailIntensity > 0
      && config.interaction.enabled
      && resolveInteractionActions(config.interaction).dragRotate
  },
  {
    id: "energy-pulse",
    label: "能量脉冲",
    description: "短按时在星场表面传播的屏幕空间波前。",
    isEnabled: (config) => config.interaction.enabled
      && resolveInteractionActions(config.interaction).clickPulse
  }
];
