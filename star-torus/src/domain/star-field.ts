export const SHAPE_IDS = [
  "torus",
  "sphere",
  "mobius",
  "torus-knot",
  "klein",
  "superellipsoid",
  "helicoid",
  "double-helix",
  "wave-surface",
  "flow-ribbon",
  "heart",
  "galaxy",
  "network-globe",
  "particle-logo",
  "light-tunnel",
  "lissajous-orbit",
  "gyroid",
  "metaball",
  "particle-terrain",
  "dna-ring"
] as const;
export type ShapeId = (typeof SHAPE_IDS)[number];

export type HoldMode = "magnet" | "freeze";

export const INTERACTION_ACTION_IDS = [
  "hoverLight",
  "pointerParallax",
  "dragRotate",
  "wheelZoom",
  "clickPulse",
  "holdAction"
] as const;
export type InteractionActionId = (typeof INTERACTION_ACTION_IDS)[number];
export type StarInteractionActions = Record<InteractionActionId, boolean>;

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
  parallaxStrength?: number;
  actions?: Partial<StarInteractionActions>;
}

export interface StarFieldConfig {
  version: 1;
  shape: ShapeId;
  theme: StarTheme;
  motion: StarMotionConfig;
  effects: StarEffectConfig;
  interaction: StarInteractionConfig;
}

export type FormFieldConfig = StarFieldConfig;

export const DEFAULT_INTERACTION_ACTIONS: StarInteractionActions = {
  hoverLight: true,
  pointerParallax: true,
  dragRotate: true,
  wheelZoom: true,
  clickPulse: true,
  holdAction: true
};

export const DEFAULT_PARALLAX_STRENGTH = 0.8;

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
    holdMode: "magnet",
    parallaxStrength: DEFAULT_PARALLAX_STRENGTH,
    actions: { ...DEFAULT_INTERACTION_ACTIONS }
  }
};

export const DEFAULT_FORM_FIELD_CONFIG = DEFAULT_STAR_FIELD_CONFIG;

export function cloneStarFieldConfig(config: StarFieldConfig): StarFieldConfig {
  return {
    version: 1,
    shape: config.shape,
    theme: { ...config.theme },
    motion: { ...config.motion },
    effects: { ...config.effects },
    interaction: {
      enabled: config.interaction.enabled,
      holdMode: config.interaction.holdMode,
      parallaxStrength: resolveParallaxStrength(config.interaction),
      actions: resolveInteractionActions(config.interaction)
    }
  };
}

export const cloneFormFieldConfig = cloneStarFieldConfig;

export function resolveInteractionActions(
  interaction: StarInteractionConfig
): StarInteractionActions {
  return {
    ...DEFAULT_INTERACTION_ACTIONS,
    ...interaction.actions
  };
}

export function resolveParallaxStrength(interaction: StarInteractionConfig): number {
  return Math.min(
    1.5,
    Math.max(0, interaction.parallaxStrength ?? DEFAULT_PARALLAX_STRENGTH)
  );
}
