export const SHAPE_IDS = ["torus", "sphere", "mobius"] as const;
export type ShapeId = (typeof SHAPE_IDS)[number];

export type HoldMode = "magnet" | "freeze";

export type RuntimeStatus =
  | "disabled"
  | "idle"
  | "dragging"
  | "attracting"
  | "repelling"
  | "frozen";

export interface StarTheme {
  background: string;
  star: string;
  glow: string;
}

export interface StarMotionConfig {
  flowSpeed: number;
  pointScale: number;
  morphDuration: number;
}

export interface StarEffectConfig {
  hoverRadius: number;
  hoverIntensity: number;
  trailIntensity: number;
}

export interface StarInteractionConfig {
  enabled: boolean;
  holdMode: HoldMode;
}

export interface StarFieldConfig {
  version: 1;
  shape: ShapeId;
  theme: StarTheme;
  motion: StarMotionConfig;
  effects: StarEffectConfig;
  interaction: StarInteractionConfig;
}

export const DEFAULT_STAR_FIELD_CONFIG: StarFieldConfig = {
  version: 1,
  shape: "torus",
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

export function cloneStarFieldConfig(config: StarFieldConfig): StarFieldConfig {
  return {
    version: 1,
    shape: config.shape,
    theme: { ...config.theme },
    motion: { ...config.motion },
    effects: { ...config.effects },
    interaction: { ...config.interaction }
  };
}
